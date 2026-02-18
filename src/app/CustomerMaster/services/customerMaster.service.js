import { StatusCodes } from "http-status-codes";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { User } from "../models/userMaster.model.js";
import { getJwtToken } from "../../../utils/token.utils.js";
import { STATUS } from "../../../constants/status.js";
import { UserType } from "../models/userType.js";
import mongoose from "mongoose";
import { Customer } from "../models/customerMaster.model.js";
import { generateUserId } from "../../../utils/generateUserId.util.js";

export class CustomerMasterService {
  generateSlug(name) {
    return name.trim().toLowerCase().replace(/\s+/g, "-");
  }

  async generateCustomerId() {
    const last = await Customer.findOne(
      { customerId: { $regex: /^SBCUSTOMER-/ } },
      { customerId: 1 },
    )
      .sort({ customerId: -1 })
      .lean();

    const next = last ? parseInt(last.customerId.split("-")[1]) + 1 : 1;

    return `SBCUSTOMER-${String(next).padStart(3, "0")}`;
  }

  validate(data, isUpdate = false) {
    const required = [
      "companyName",
      "customerName",
      "customerType",
      "gstNumber",
    ];

    if (!isUpdate) {
      for (let field of required) {
        if (!data[field]) return `${field} is required`;
      }
    }

    if (data.geoLocation?.coordinates?.length !== 2) {
      return "Invalid geoLocation coordinates";
    }

    return null;
  }

  async create(data, loggedInUser) {
    try {
      const error = this.validate(data);
      if (error) {
        return {
          success: false,
          data: { message: error },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const gstExists = await Customer.exists({
        gstNumber: data.gstNumber.toUpperCase(),
      });

      if (gstExists) {
        return {
          success: false,
          data: { message: "GST already exists" },
          statusCode: StatusCodes.CONFLICT,
        };
      }

      const emailExists = await User.exists({
        loginEmail: data.adminEmail.toLowerCase(),
      });

      if (emailExists) {
        return {
          success: false,
          data: { message: "Admin email already exists" },
          statusCode: StatusCodes.CONFLICT,
        };
      }

      const customerId = await this.generateCustomerId();
      const userId = await generateUserId(data.companyName);
      const url = this.generateSlug(data.companyName);

      const role = await UserType.findOne(
        { userTypeName: "ADMIN", status: STATUS.ACTIVE },
        { _id: 1 },
      ).lean();

      if (!role) {
        return {
          success: false,
          data: { message: "ADMIN role not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      const hashedPassword = await argon2.hash(data.adminPassword);

      const [customer] = await Customer.create([
        {
          ...data,
          customerId,
          gstNumber: data.gstNumber.toUpperCase(),
          adminEmail: data.adminEmail.toLowerCase(),
          adminPassword: hashedPassword,
          url,
          createdBy: loggedInUser.userName,
        },
      ]);

      await User.create([
        {
          userId,
          userName: data.customerName,
          loginEmail: data.adminEmail.toLowerCase(),
          loginPassword: hashedPassword,
          userTypeId: role._id,
          customerId: customer._id,
          companyName: data.companyName,
          url,
          createdBy: loggedInUser.userName,
        },
      ]);

      return {
        success: true,
        statusCode: StatusCodes.CREATED,
        data: {
          customerId,
          companyName: data.companyName,
          adminEmail: data.adminEmail,
        },
      };
    } catch (error) {
      return {
        success: false,
        data: { message: error.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async get(id) {
    try {
      const filter = { status: STATUS.ACTIVE };
      if (id) filter._id = id;

      const customers = await Customer.find(filter, {
        adminPassword: 0,
      }).lean();

      if (id && !customers.length) {
        return {
          success: false,
          data: { message: "Customer not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: id ? customers[0] : customers,
      };
    } catch (error) {
      return {
        success: false,
        data: { message: error.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async update(id, data, loggedInUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {
        success: false,
        data: { message: "Invalid customer ID" },
        statusCode: 400,
      };
    }

    if (!data || Object.keys(data).length === 0) {
      return {
        success: false,
        data: { message: "No fields provided for update" },
        statusCode: 400,
      };
    }

    try {
      const customer = await Customer.findOne({ _id: id });

      if (!customer) {
        return {
          success: false,
          data: { message: "Customer not found" },
          statusCode: 404,
        };
      }

      if (customer.status !== STATUS.ACTIVE) {
        return {
          success: false,
          data: { message: "Cannot update inactive or deleted customer" },
          statusCode: 400,
        };
      }

      const updateData = {
        updatedBy: loggedInUser.userName,
      };

      /* ---------------- GST UPDATE ---------------- */
      if (data.gstNumber) {
        const newGST = data.gstNumber.toUpperCase();

        const gstExists = await Customer.exists({
          gstNumber: newGST,
          _id: { $ne: id },
          status: STATUS.ACTIVE,
        });

        if (gstExists) {
          return {
            success: false,
            data: { message: "GST already exists" },
            statusCode: 409,
          };
        }

        updateData.gstNumber = newGST;
      }

      /* ---------------- COMPANY NAME UPDATE ---------------- */
      if (data.companyName) {
        const newCompany = data.companyName.trim();

        const companyExists = await Customer.findOne(
          {
            companyName: newCompany,
            _id: { $ne: id },
          },
          { status: 1 },
        ).lean();

        if (companyExists && companyExists.status === STATUS.ACTIVE) {
          return {
            success: false,
            data: { message: "Company name already exists" },
            statusCode: 409,
          };
        }

        const newUrl = newCompany.toLowerCase().replace(/\s+/g, "-");

        updateData.companyName = newCompany;
        updateData.url = newUrl;

        // Propagate to users
        await User.updateMany(
          { customerId: id },
          {
            companyName: newCompany,
            url: newUrl,
          },
        );
      }

      /* ---------------- ADMIN EMAIL UPDATE ---------------- */
      if (data.adminEmail) {
        const newEmail = data.adminEmail.toLowerCase();

        const emailExists = await User.exists({
          loginEmail: newEmail,
          customerId: { $ne: id },
          status: STATUS.ACTIVE,
        });

        if (emailExists) {
          return {
            success: false,
            data: { message: "Admin email already exists" },
            statusCode: 409,
          };
        }

        updateData.adminEmail = newEmail;

        await User.updateMany({ customerId: id }, { loginEmail: newEmail });
      }

      /* ---------------- OTHER FIELDS ---------------- */
      const allowed = [
        "customerName",
        "customerType",
        "transitDays",
        "shippingAddress1",
        "shippingAddress2",
        "billingAddress",
        "geoLocation",
      ];

      for (let key of allowed) {
        if (data[key] !== undefined) {
          updateData[key] = data[key];
        }
      }

      const updatedCustomer = await Customer.findOneAndUpdate(
        { _id: id },
        updateData,
        { new: true, projection: { adminPassword: 0 } },
      );

      return {
        success: true,
        statusCode: 200,
        data: {
          customerId: updatedCustomer.customerId,
          companyName: updatedCustomer.companyName,
          gstNumber: updatedCustomer.gstNumber,
          adminEmail: updatedCustomer.adminEmail,
        },
      };
    } catch (error) {
      return {
        success: false,
        data: { message: error.message },
        statusCode: 500,
      };
    }
  }

  async delete(id, loggedInUser) {
    try {
      const customer = await Customer.findOneAndUpdate(
        { _id: id, status: STATUS.ACTIVE },
        {
          status: STATUS.DELETED,
          updatedBy: loggedInUser.userName,
        },
      );

      if (!customer) {
        return {
          success: false,
          data: { message: "Customer not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      await User.updateMany({ customerId: id }, { status: STATUS.DELETED });

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: { message: "Customer deactivated successfully" },
      };
    } catch (error) {
      return {
        success: false,
        data: { message: error.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /* ---------------- LOGIN ---------------- */
  async login(data) {
    try {
      const { loginEmail, loginPassword } = data;

      if (!loginEmail || !loginPassword) {
        return {
          success: false,
          data: { message: "Email and password required" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const user = await User.findOne({ loginEmail }).populate("userTypeId");

      if (!user) {
        return {
          success: false,
          data: { message: "Invalid email or password" },
          statusCode: StatusCodes.UNAUTHORIZED,
        };
      }

      const isValid = await argon2.verify(user.loginPassword, loginPassword);

      if (!isValid) {
        return {
          success: false,
          data: { message: "Invalid email or password" },
          statusCode: StatusCodes.UNAUTHORIZED,
        };
      }

      if (user.status !== STATUS.ACTIVE) {
        return {
          success: false,
          data: { message: "Account inactive" },
          statusCode: StatusCodes.FORBIDDEN,
        };
      }

      // Generate tokens
      const tokens = getJwtToken({
        _id: user._id,
        role: user.userTypeId.userTypeName,
        company: user.companyName,
        customerId: user.customerId,
        userName: user.userName,
        url: user.url,
        userTypeId: user.userTypeId,
      });

      // Store hashed refresh token
      const hashedRefresh = await argon2.hash(tokens.refreshToken);

      user.refreshToken = hashedRefresh;
      await user.save();

      return {
        success: true,
        data: { tokens },
        statusCode: StatusCodes.OK,
      };
    } catch (err) {
      console.log("Login Error:", err.message);

      return {
        success: false,
        data: { message: "Server error" },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /* ---------------- REFRESH TOKEN ---------------- */
  async refresh(authHeader) {
    try {
      if (!authHeader?.startsWith("Bearer ")) {
        return {
          success: false,
          data: { message: "Refresh token required" },
          statusCode: StatusCodes.UNAUTHORIZED,
        };
      }

      const refreshToken = authHeader.split(" ")[1];

      let decoded;

      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      } catch {
        return {
          success: false,
          data: { message: "Invalid or expired refresh token" },
          statusCode: StatusCodes.UNAUTHORIZED,
        };
      }

      if (decoded.type !== "refreshToken") {
        return {
          success: false,
          data: { message: "Invalid token type" },
          statusCode: StatusCodes.UNAUTHORIZED,
        };
      }

      const user = await User.findById(decoded.data.id).populate("userTypeId");

      if (!user || !user.refreshToken) {
        return {
          success: false,
          data: { message: "Unauthorized request" },
          statusCode: StatusCodes.UNAUTHORIZED,
        };
      }

      const isValid = await argon2.verify(user.refreshToken, refreshToken);

      if (!isValid) {
        return {
          success: false,
          data: { message: "Refresh token mismatch" },
          statusCode: StatusCodes.UNAUTHORIZED,
        };
      }

      const newAccessToken = getJwtToken({
        _id: user._id,
        role: user.userTypeId.userTypeName,
        customerId: user.customerId,
        name: user.userName,
      }).accessToken;

      return {
        success: true,
        data: { accessToken: newAccessToken },
        statusCode: StatusCodes.OK,
      };
    } catch (err) {
      console.log("Refresh Error:", err.message);

      return {
        success: false,
        data: { message: "Server error" },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /* ---------------- LOGOUT ---------------- */
  async logout(userId) {
    try {
      await User.findByIdAndUpdate(userId, {
        refreshToken: null,
      });

      return {
        success: true,
        data: { message: "Logged out successfully" },
        statusCode: StatusCodes.OK,
      };
    } catch (err) {
      return {
        success: false,
        data: { message: "Server error" },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  /* ---------------- GET PROFILE ---------------- */
  async getProfile(userId) {
    try {
      const user = await User.findById(userId)
        .select("-loginPassword -refreshToken")
        .populate("userTypeId");

      return {
        success: true,
        data: user,
        statusCode: StatusCodes.OK,
      };
    } catch {
      return {
        success: false,
        data: { message: "User not found" },
        statusCode: StatusCodes.NOT_FOUND,
      };
    }
  }

  async getCustomers(id) {
    try {
      // GET SINGLE
      if (id) {
        const customer = await Customer.findOne({
          _id: id,
          status: STATUS.ACTIVE,
        });

        if (!customer) {
          return {
            success: false,
            data: { message: "Customer not found" },
            statusCode: StatusCodes.NOT_FOUND,
          };
        }

        return {
          success: true,
          data: customer,
          statusCode: StatusCodes.OK,
        };
      }

      // GET ALL
      const customers = await Customer.find({
        status: STATUS.ACTIVE,
      });

      return {
        success: true,
        data: customers,
        statusCode: StatusCodes.OK,
      };
    } catch (error) {
      return {
        success: false,
        data: { message: error.message },
        statusCode: StatusCodes.BAD_REQUEST,
      };
    }
  }
}
