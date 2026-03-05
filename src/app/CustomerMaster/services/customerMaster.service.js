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
import { CustomerType } from "../models/customerType.models.js";
import { sendMail } from "../../../utils/mailer.js";
import { buildPermissionsFromRequest } from "../../../utils/permission.util.js";
import { config } from "dotenv";

config();


export class CustomerMasterService {
  generateSlug(name) {
    return name.trim().toLowerCase().replace(/\s+/g, "-");
  }

  async generateCustomerId(companyName) {
    // 1️⃣ Take first 5 letters (remove spaces, uppercase)
    const prefix = companyName
      .replace(/\s+/g, "") // remove spaces
      .substring(0, 5) // first 5 letters
      .toUpperCase(); // uppercase

    const regex = new RegExp(`^${prefix}-`);

    // 2️⃣ Find last customer with same prefix
    const lastCustomer = await Customer.findOne(
      { customerId: { $regex: regex } },
      { customerId: 1 },
    )
      .sort({ customerId: -1 })
      .lean();

    let nextNumber = 1;

    if (lastCustomer) {
      const lastNumber = parseInt(lastCustomer.customerId.split("-")[1]);
      nextNumber = lastNumber + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(3, "0")}`;
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
      // ================================
      // ✅ 1. OWNER CHECK
      // ================================
      if (!loggedInUser?.owner) {
        return {
          success: false,
          data: { message: "Only owner users can create customers" },
          statusCode: StatusCodes.FORBIDDEN,
        };
      }

      // ================================
      // ✅ 2. BASIC VALIDATION
      // ================================
      const error = this.validate(data);
      if (error) {
        return {
          success: false,
          data: { message: error },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      if (!Array.isArray(data.mobileNumber) || data.mobileNumber.length === 0) {
        return {
          success: false,
          data: { message: "At least one mobile number is required" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      // ================================
      // ✅ 3. VALIDATE CUSTOMER TYPE
      // ================================
      if (!mongoose.Types.ObjectId.isValid(data.customerType)) {
        return {
          success: false,
          data: { message: "Invalid customer type id" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const customerType = await CustomerType.findOne(
        { _id: data.customerType, status: STATUS.ACTIVE },
        { _id: 1, name: 1 },
      ).lean();

      if (!customerType) {
        return {
          success: false,
          data: { message: "Customer type not found or inactive" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      // ================================
      // ✅ CHECK COMPANY NAME (ACTIVE)
      // ================================
      const companyExists = await Customer.exists({
        companyName: data.companyName.trim(),
        status: STATUS.ACTIVE,
      });

      if (companyExists) {
        return {
          success: false,
          data: { message: "Company name already exists" },
          statusCode: StatusCodes.CONFLICT,
        };
      }

      // ================================
      // ✅ 4. DUPLICATE CHECKS
      // ================================
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

      // ================================
      // ✅ 5. GENERATE IDS
      // ================================
      const customerId = await this.generateCustomerId(data.companyName);
      const userId = await generateUserId(data.companyName);
      const url = this.generateSlug(data.companyName);

      // ================================
      // ✅ 6. GET SUPER ADMIN ROLE
      // ================================
      const role = await UserType.findOne(
        { userTypeName: "SUPER ADMIN", status: STATUS.ACTIVE },
        { _id: 1 },
      ).lean();

      if (!role) {
        return {
          success: false,
          data: { message: "SUPER ADMIN role not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      // ================================
      // ✅ 7. HASH PASSWORD
      // ================================
      const plainPassword = data.adminPassword;
      const hashedPassword = await argon2.hash(plainPassword);

      // ================================
      // ✅ 8. CREATE CUSTOMER
      // ================================
      const customer = await Customer.create([
        {
          customerId,
          companyName: data.companyName.trim(),
          customerName: data.customerName.trim(),
          customerType: data.customerType,
          transitDays: data.transitDays,
          gstNumber: data.gstNumber.toUpperCase(),
          adminEmail: data.adminEmail.toLowerCase(),
          mobileNumber: data.mobileNumber,
          position: data.position,
          department: data.department,
          adminPassword: hashedPassword,
          shippingAddress1: data.shippingAddress1,
          shippingAddress2: data.shippingAddress2,
          billingAddress: data.billingAddress,
          geoLocation: data.geoLocation,
          url,
          owner: false,
          createdBy: loggedInUser.userName,
        },
      ]);

      // ================================
      // ✅ 9. BUILD PERMISSIONS
      // ================================
      const userPermissions = buildPermissionsFromRequest(data.permissions);

      // ================================
      // ✅ 10. CREATE ADMIN USER
      // ================================
      await User.create([
        {
          userId,
          userName: data.customerName.trim(),
          loginEmail: data.adminEmail.toLowerCase(),
          loginPassword: hashedPassword,
          mobile: data.mobileNumber[0], // ✅ 0th index
          position: data.position,
          department: data.department,
          userTypeId: role._id,
          customerId: customer[0]._id,
          companyName: data.companyName.trim(),
          url,
          permissions: userPermissions,
          isMainAdmin: true,
          createdBy: loggedInUser.userName,
        },
      ]);
      const loginLink = PROCESS.ENV.FRONTEDN_URL;
      // ================================
      // ✅ 12. SEND EMAIL (Optional)
      // ================================
      try {
        await sendMail({
          to: data.adminEmail,
          subject: "SmartBin Admin Account Created",
          html: `
          <h2>Welcome to SmartBin</h2>
          <p>Your company <b>${data.companyName}</b> has been successfully registered.</p>
          <p>Login Link : <b>${loginLink}
          <p><b>Login Email:</b> ${data.adminEmail}</p>
          <p><b>Password:</b> ${plainPassword}</p>
          <p>Please login and change your password immediately.</p>
        `,
        });
      } catch (mailError) {
        console.error("Email sending failed:", mailError.message);
      }

      return {
        success: true,
        statusCode: StatusCodes.CREATED,
        data: {
          customerId,
          companyName: data.companyName,
          adminEmail: data.adminEmail,
          customerType: customerType.name,
          message: "Customer created successfully",
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

  async get(id, query, loggedInUser) {
    try {
      // ==========================================
      // ✅ 1. OWNER CHECK
      // ==========================================
      if (!loggedInUser?.owner) {
        return {
          success: false,
          statusCode: StatusCodes.FORBIDDEN,
          data: { message: "Only owner users can access customers" },
        };
      }

      // ==========================================
      // ✅ 2. BASE FILTER
      // ==========================================
      const baseFilter = {
        status: { $in: [STATUS.ACTIVE, STATUS.INACTIVE] },
        owner: false,
      };

      // ==========================================
      // 🔹 CASE 1: GET BY ID
      // ==========================================
      if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return {
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            data: { message: "Invalid ID" },
          };
        }

        // ------------------------------------------
        // Fetch Customer
        // ------------------------------------------
        const customer = await Customer.findOne(
          { ...baseFilter, _id: id },
          { adminPassword: 0 },
        )
          .populate("customerType", "customerTypeName")
          .lean();

        if (!customer) {
          return {
            success: false,
            statusCode: StatusCodes.NOT_FOUND,
            data: { message: "Customer not found" },
          };
        }

        // ------------------------------------------
        // Fetch Main Admin (NO strict status filter)
        // ------------------------------------------
        const mainAdmin = await User.findOne(
          {
            customerId: customer._id,
            isMainAdmin: true,
          },
          {
            loginPassword: 0,
            refreshToken: 0,
            otp: 0,
            otpExpiry: 0,
            resetOtp: 0,
            resetOtpExpiry: 0,
            __v: 0,
          },
        ).lean();

        // ------------------------------------------
        // If no main admin found, try fallback
        // (prevents null due to bad data)
        // ------------------------------------------
        let adminData = null;

        if (mainAdmin) {
          adminData = {
            userId: mainAdmin.userId,
            loginEmail: mainAdmin.loginEmail,
            mobile: mainAdmin.mobile,
            position: mainAdmin.position,
            department: mainAdmin.department,
            permissions: mainAdmin.permissions || [],
            status: mainAdmin.status,
          };
        } else {
          // Fallback: get first user of that customer
          const fallbackUser = await User.findOne(
            { customerId: customer._id },
            { loginPassword: 0 },
          ).lean();

          if (fallbackUser) {
            adminData = {
              userId: fallbackUser.userId,
              loginEmail: fallbackUser.loginEmail,
              mobile: fallbackUser.mobile,
              position: fallbackUser.position,
              department: fallbackUser.department,
              permissions: fallbackUser.permissions || [],
              status: fallbackUser.status,
            };
          }
        }

        return {
          success: true,
          statusCode: StatusCodes.OK,
          data: {
            ...customer,
            superAdmin: adminData,
          },
        };
      }

      // ==========================================
      // 🔹 CASE 2: PAGINATED GET ALL
      // ==========================================
      let { page = 1, limit = 10 } = query;

      page = parseInt(page);
      limit = parseInt(limit);

      if (isNaN(page) || page < 1) page = 1;
      if (isNaN(limit) || limit < 1) limit = 10;
      if (limit > 100) limit = 100;

      const skip = (page - 1) * limit;

      const [customers, total] = await Promise.all([
        Customer.find(baseFilter, { adminPassword: 0 })
          .populate("customerType", "customerTypeName")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        Customer.countDocuments(baseFilter),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          records: customers,
        },
      };
    } catch (error) {
      return {
        success: false,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        data: { message: error.message },
      };
    }
  }

  async getAll(loggedInUser) {
    try {
      // Base filter for active/inactive customers
      const filter = {
        status: { $in: [STATUS.ACTIVE, STATUS.INACTIVE] },
      };

      // Only filter by _id if the user is NOT an owner
      if (!loggedInUser.owner) {
        const customerObj = loggedInUser.customerId;

        if (!customerObj || !customerObj._id) {
          return {
            success: false,
            statusCode: 400,
            data: { message: "Customer ID missing in login token" },
          };
        }

        // Ensure it’s a valid ObjectId string
        if (!mongoose.Types.ObjectId.isValid(customerObj._id)) {
          return {
            success: false,
            statusCode: 400,
            data: { message: "Invalid customer ID in token" },
          };
        }

        filter._id = new mongoose.Types.ObjectId(customerObj._id);
      }

      const customers = await Customer.find(filter, { adminPassword: 0 })
        .populate("customerType", "customerTypeName")
        .lean();

      return {
        success: true,
        statusCode: 200,
        data: loggedInUser.owner ? customers : customers[0] || null,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        data: { message: error.message },
      };
    }
  }

  async update(id, data, loggedInUser) {
    try {
      // ==========================================
      // ✅ 1. OWNER CHECK
      // ==========================================
      if (!loggedInUser?.owner) {
        return {
          success: false,
          data: { message: "Only owner users can update customers" },
          statusCode: 403,
        };
      }

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

      // ==========================================
      // ✅ 2. FETCH CUSTOMER
      // ==========================================
      const customer = await Customer.findOne(
        {
          _id: id,
          status: { $in: [STATUS.ACTIVE, STATUS.INACTIVE] },
        },
        null,
      );

      if (!customer) {
        return {
          success: false,
          data: { message: "Customer not found" },
          statusCode: 404,
        };
      }

      const updateData = {
        updatedBy: loggedInUser.userName,
      };

      // =========================================================
      // 🔐 PERMISSIONS UPDATE (Main Admin Only)
      // =========================================================
      if (data.permissions && Array.isArray(data.permissions)) {
        const normalizedPermissions = buildPermissionsFromRequest(
          data.permissions,
        );

        await User.updateOne(
          {
            customerId: customer._id,
            isMainAdmin: true,
          },
          {
            permissions: normalizedPermissions,
            updatedBy: loggedInUser.userName,
          },
        );
      }

      // =========================================================
      // 🏷 CUSTOMER TYPE UPDATE
      // =========================================================
      if (data.customerType) {
        if (!mongoose.Types.ObjectId.isValid(data.customerType)) {
          throw new Error("Invalid customer type id");
        }

        const customerType = await CustomerType.findOne(
          {
            _id: data.customerType,
            status: STATUS.ACTIVE,
          },
          null,
        );

        if (!customerType) {
          throw new Error("Customer type not found or inactive");
        }

        updateData.customerType = data.customerType;
      }

      // =========================================================
      // 🧾 GST UPDATE
      // =========================================================
      if (data.gstNumber) {
        const newGST = data.gstNumber.toUpperCase().trim();

        const gstExists = await Customer.exists({
          gstNumber: newGST,
          _id: { $ne: id },
          status: STATUS.ACTIVE,
        });

        if (gstExists) throw new Error("GST already exists");

        updateData.gstNumber = newGST;
      }

      // =========================================================
      // 🏢 COMPANY NAME UPDATE (Sync User Table)
      // =========================================================
      if (data.companyName) {
        const newCompany = data.companyName.trim();

        const companyExists = await Customer.exists({
          companyName: newCompany,
          _id: { $ne: id },
          status: STATUS.ACTIVE,
        });

        if (companyExists) throw new Error("Company name already exists");

        const newUrl = newCompany.toLowerCase().replace(/\s+/g, "-");

        updateData.companyName = newCompany;
        updateData.url = newUrl;

        await User.updateMany(
          { customerId: customer._id },
          {
            companyName: newCompany,
            url: newUrl,
            updatedBy: loggedInUser.userName,
          },
        );
      }

      // =========================================================
      // 📱 MOBILE NUMBER UPDATE (Sync Main Admin)
      // =========================================================
      if (data.mobileNumber) {
        if (
          !Array.isArray(data.mobileNumber) ||
          data.mobileNumber.length === 0
        ) {
          throw new Error("Mobile number must be a non-empty array");
        }

        updateData.mobileNumber = data.mobileNumber;

        await User.updateOne(
          {
            customerId: customer._id,
            isMainAdmin: true,
          },
          {
            mobile: data.mobileNumber[0], // 0th index sync
            updatedBy: loggedInUser.userName,
          },
        );
      }

      // =========================================================
      // 👔 POSITION UPDATE (Sync Main Admin)
      // =========================================================
      if (data.position !== undefined) {
        updateData.position = data.position;

        await User.updateOne(
          {
            customerId: customer._id,
            isMainAdmin: true,
          },
          {
            position: data.position,
            updatedBy: loggedInUser.userName,
          },
        );
      }

      // =========================================================
      // 🏢 DEPARTMENT UPDATE (Sync Main Admin)
      // =========================================================
      if (data.department !== undefined) {
        updateData.department = data.department;

        await User.updateOne(
          {
            customerId: customer._id,
            isMainAdmin: true,
          },
          {
            department: data.department,
            updatedBy: loggedInUser.userName,
          },
        );
      }

      // =========================================================
      // 🧩 OTHER SAFE FIELDS
      // =========================================================
      const allowedFields = [
        "customerName",
        "transitDays",
        "shippingAddress1",
        "shippingAddress2",
        "billingAddress",
        "geoLocation",
        "status",
      ];

      for (let key of allowedFields) {
        if (data[key] !== undefined) {
          updateData[key] = data[key];
        }
      }

      // =========================================================
      // ✅ FINAL UPDATE
      // =========================================================
      const updatedCustomer = await Customer.findOneAndUpdate(
        { _id: id },
        updateData,
        {
          returnDocument: "after",
          projection: { adminPassword: 0 },
        },
      );

      return {
        success: true,
        statusCode: 200,
        data: {
          customerId: updatedCustomer.customerId,
          companyName: updatedCustomer.companyName,
          gstNumber: updatedCustomer.gstNumber,
          adminEmail: updatedCustomer.adminEmail,
          message: "Customer updated successfully",
        },
      };
    } catch (error) {
      return {
        success: false,
        data: { message: error.message },
        statusCode: 400,
      };
    }
  }

  async delete(id, loggedInUser) {
    try {
      // ==========================================
      // ✅ 1. OWNER CHECK
      // ==========================================
      if (!loggedInUser?.owner) {
        return {
          success: false,
          data: { message: "Only owner users can delete customers" },
          statusCode: StatusCodes.FORBIDDEN,
        };
      }

      // ==========================================
      // ✅ 2. VALIDATE ID
      // ==========================================
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          data: { message: "Invalid customer ID" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      // ==========================================
      // ✅ 3. OWNER-SAFE SOFT DELETE
      // ==========================================
      const customer = await Customer.findOneAndUpdate(
        {
          _id: id,
          status: { $in: [STATUS.ACTIVE, STATUS.INACTIVE] },
        },
        {
          status: STATUS.DELETED,
          updatedBy: loggedInUser.userName,
        },
        { new: true },
      );

      if (!customer) {
        return {
          success: false,
          data: { message: "Customer not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      // ==========================================
      // ✅ 4. SOFT DELETE RELATED USERS
      // ==========================================
      await User.updateMany(
        { customerId: id },
        {
          status: STATUS.DELETED,
          updatedBy: loggedInUser.userName,
        },
      );

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

      const user = await User.findOne({ loginEmail })
        .populate("userTypeId")
        .populate("customerId");
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
        customerId: user.customerId,
        url: user.url,
        userTypeId: user.userTypeId,
        isOwner: user.customerId.owner,
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
