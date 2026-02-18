import argon2 from "argon2";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { STATUS } from "../../../constants/status.js";
import { User } from "../models/userMaster.model.js";
import { Customer } from "../models/customerMaster.model.js";
import { UserType } from "../models/userType.js";
import { generateUserId } from "../../../utils/generateUserId.util.js";
import { getJwtToken } from "../../../utils/token.utils.js";

export class UserMasterService {
  async create(data, loggedInUser) {
    console.log(data);
    try {
      const {
        userName,
        loginEmail,
        loginPassword,
        userTypeId,
        position,
        mobile,
      } = data;

      if (!userName || !loginEmail || !loginPassword || !userTypeId) {
        return {
          success: false,
          data: { errors: "Required fields missing" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      if (!mongoose.Types.ObjectId.isValid(userTypeId)) {
        return {
          success: false,
          data: { errors: "Invalid userTypeId" },
          statusCode: 400,
        };
      }

      const email = loginEmail.toLowerCase();

      const emailExists = await User.exists({ loginEmail: email });

      if (emailExists) {
        return {
          success: false,
          data: { errors: "Email already exists" },
          statusCode: StatusCodes.CONFLICT,
        };
      }

      // Get customer from token
      const customer = await Customer.findOne(
        { _id: loggedInUser.customerId, status: STATUS.ACTIVE },
        { companyName: 1, url: 1 },
      ).lean();

      if (!customer) {
        return {
          success: false,
          data: { errors: "Customer not found or inactive" },
          statusCode: 400,
        };
      }

      // Check userType exists
      const role = await UserType.findOne({
        _id: userTypeId,
      }).lean();

      console.log(role);

      if (!role) {
        return {
          success: false,
          data: { message: "Invalid user type" },
          statusCode: 400,
        };
      }

      const userId = await generateUserId(customer.companyName);

      const hashedPassword = await argon2.hash(loginPassword);

      const user = await User.create({
        userId,
        userName,
        loginEmail: email,
        loginPassword: hashedPassword,
        userTypeId,
        customerId: customer._id,
        companyName: customer.companyName,
        url: customer.url,
        position,
        mobile,
        createdBy: loggedInUser.userName,
      });

      return {
        success: true,
        statusCode: StatusCodes.CREATED,
        data: {
          userId: user.userId,
          userName: user.userName,
          loginEmail: user.loginEmail,
        },
      };
    } catch (error) {
      return {
        success: false,
        data: { errors: error.message },
        statusCode: 500,
      };
    }
  }

  async get(id, loggedInUser) {
    try {
      const filter = {
        customerId: loggedInUser.customerId,
        status: STATUS.ACTIVE,
      };

      if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return {
            success: false,
            data: { errors: "Invalid user ID" },
            statusCode: 400,
          };
        }
        filter._id = id;
      }

      const users = await User.find(filter, {
        loginPassword: 0,
        refreshToken: 0,
      }).lean();

      if (id && users.length === 0) {
        return {
          success: false,
          data: { errors: "User not found" },
          statusCode: 404,
        };
      }

      return {
        success: true,
        statusCode: 200,
        data: id ? users[0] : users,
      };
    } catch (error) {
      return {
        success: false,
        data: { errors: error.message },
        statusCode: 500,
      };
    }
  }

  async update(id, data, loggedInUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          data: { errors: "Invalid user ID" },
          statusCode: 400,
        };
      }

      const updateData = {
        updatedBy: loggedInUser.userName,
      };

      if (data.loginEmail) {
        const email = data.loginEmail.toLowerCase();

        const exists = await User.exists({
          loginEmail: email,
          _id: { $ne: id },
        });

        if (exists) {
          return {
            success: false,
            data: { errors: "Email already exists" },
            statusCode: 409,
          };
        }

        updateData.loginEmail = email;
      }

      const allowed = ["userName", "userTypeId", "position", "mobile"];

      for (let key of allowed) {
        if (data[key] !== undefined) {
          updateData[key] = data[key];
        }
      }

      const updated = await User.findOneAndUpdate(
        {
          _id: id,
          customerId: loggedInUser.customerId,
          status: STATUS.ACTIVE,
        },
        updateData,
        { new: true, projection: { loginPassword: 0 } },
      ).lean();

      if (!updated) {
        return {
          success: false,
          data: { errors: "User not found" },
          statusCode: 404,
        };
      }

      return {
        success: true,
        statusCode: 200,
        data: updated,
      };
    } catch (error) {
      return {
        success: false,
        data: { errors: error.message },
        statusCode: 500,
      };
    }
  }
  async delete(id, loggedInUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          data: { errors: "Invalid user ID" },
          statusCode: 400,
        };
      }

      const deleted = await User.findOneAndUpdate(
        {
          _id: id,
          customerId: loggedInUser.customerId,
          status: STATUS.ACTIVE,
        },
        {
          status: STATUS.INACTIVE,
          updatedBy: loggedInUser.userName,
        },
        { new: true },
      );

      if (!deleted) {
        return {
          success: false,
          data: { errors: "User not found" },
          statusCode: 404,
        };
      }

      return {
        success: true,
        statusCode: 200,
        data: { message: "User deactivated successfully" },
      };
    } catch (error) {
      return {
        success: false,
        data: { errors: error.message },
        statusCode: 500,
      };
    }
  }

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

      const email = loginEmail.toLowerCase().trim();

      // 1. Find User First
      const user = await User.findOne({
        loginEmail: email,
        status: STATUS.ACTIVE,
      }).populate("userTypeId");

      if (!user) {
        return {
          success: false,
          data: { message: "Invalid email or password" },
          statusCode: StatusCodes.UNAUTHORIZED,
        };
      }

      // 2. Verify Password
      const isValid = await argon2.verify(user.loginPassword, loginPassword);

      if (!isValid) {
        return {
          success: false,
          data: { message: "Invalid email or password" },
          statusCode: StatusCodes.UNAUTHORIZED,
        };
      }

      // 3. Check Customer From User Data
      const customer = await Customer.findOne({
        _id: user.customerId,
        companyName: user.companyName,
        status: STATUS.ACTIVE,
      }).lean();

      if (!customer) {
        return {
          success: false,
          data: { message: "Company not found or inactive" },
          statusCode: StatusCodes.FORBIDDEN,
        };
      }

      // 4. Generate Tokens
      const tokens = getJwtToken({
        _id: user._id,
        customerId: user.customerId,
        userName: user.userName,
        url: user.url,
        userTypeId: user.userTypeId,
      });

      const hashedRefresh = await argon2.hash(tokens.refreshToken);
      user.refreshToken = hashedRefresh;
      await user.save();

      return {
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
        statusCode: StatusCodes.OK,
      };
    } catch (err) {
      console.log(err.message);
      return {
        success: false,
        data: { message: "Server error" },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
