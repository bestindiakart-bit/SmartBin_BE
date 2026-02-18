import argon2 from "argon2";
import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { STATUS } from "../../../constants/status.js";
import { User } from "../models/userMaster.model.js";
import { Customer } from "../models/customerMaster.model.js";
import { UserType } from "../models/userType.js";
import { generateUserId } from "../../../utils/generateUserId.util.js";
import { getJwtToken } from "../../../utils/token.utils.js";
import { sendMail } from "../../../utils/mailer.js";

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

      const isValid = await argon2.verify(user.loginPassword, loginPassword);

      if (!isValid) {
        return {
          success: false,
          data: { message: "Invalid email or password" },
          statusCode: StatusCodes.UNAUTHORIZED,
        };
      }

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

      // ---------- CASE 1: FIRST LOGIN ----------
      if (user.isFirstLogin === true) {
        return {
          success: true,
          statusCode: StatusCodes.OK,
          data: {
            message: "Login successful. Navigate to change password page.",
            isFirstLogin: true,
          },
        };
      }

      // ---------- CASE 2: NORMAL LOGIN → SEND OTP ----------

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      user.otp = await argon2.hash(otp);
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      await user.save();

      await sendMail({
        to: user.loginEmail,
        subject: "Login OTP Verification",
        html: `<p>Your login OTP is <b>${otp}</b>. Valid for 10 minutes.</p>`,
      });

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: {
          message: "OTP sent to registered email",
        },
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

  async verifyOtp(data) {
    try {
      const { loginEmail, otp } = data;

      if (!loginEmail || !otp) {
        return {
          success: false,
          data: { message: "Email and OTP required" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const email = loginEmail.toLowerCase().trim();

      const user = await User.findOne({
        loginEmail: email,
        status: STATUS.ACTIVE,
      }).populate("userTypeId");

      if (!user) {
        return {
          success: false,
          data: { message: "User not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      // ---------- CASE 1: FIRST LOGIN OTP ----------
      if (user.isFirstLogin === true) {
        if (!user.otp || !user.otpExpiry) {
          return {
            success: false,
            data: { message: "OTP not generated" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }

        if (new Date() > user.otpExpiry) {
          return {
            success: false,
            data: { message: "OTP expired" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }

        const isValidOtp = await argon2.verify(user.otp, otp);

        if (!isValidOtp) {
          return {
            success: false,
            data: { message: "Invalid OTP" },
            statusCode: StatusCodes.UNAUTHORIZED,
          };
        }

        user.isFirstLogin = false;
        user.otp = undefined;
        user.otpExpiry = undefined;
      }

      // ---------- CASE 2: RESET PASSWORD OTP ----------
      else if (user.resetPassword === true) {
        if (!user.resetOtp || !user.resetOtpExpiry) {
          return {
            success: false,
            data: { message: "Reset OTP not generated" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }

        if (new Date() > user.resetOtpExpiry) {
          return {
            success: false,
            data: { message: "OTP expired" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }

        const isValidOtp = await argon2.verify(user.resetOtp, otp);

        if (!isValidOtp) {
          return {
            success: false,
            data: { message: "Invalid OTP" },
            statusCode: StatusCodes.UNAUTHORIZED,
          };
        }

        // Clear reset flags
        user.resetPassword = false;
        user.resetOtp = undefined;
        user.resetOtpExpiry = undefined;
      } else {
        return {
          success: false,
          data: { message: "OTP verification not required" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      // -------- Generate Tokens --------

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
        statusCode: StatusCodes.OK,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      };
    } catch (err) {
      return {
        success: false,
        data: { message: "Server error" },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

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

  async resendOtp(data) {
    try {
      const { loginEmail } = data;

      if (!loginEmail) {
        return {
          success: false,
          data: { message: "Email required" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const email = loginEmail.toLowerCase().trim();

      const user = await User.findOne({
        loginEmail: email,
        status: STATUS.ACTIVE,
      });

      if (!user) {
        return {
          success: false,
          data: { message: "User not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      if (!user.isFirstLogin) {
        return {
          success: false,
          data: { message: "OTP not required for this user" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      // Generate new 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      user.otp = await argon2.hash(otp);
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
      await user.save();

      // Send Email
      await sendMail({
        to: user.loginEmail,
        subject: "Your New OTP Code",
        html: `<p>Your OTP is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
      });

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: {
          message: "OTP resent successfully",
        },
      };
    } catch (err) {
      return {
        success: false,
        data: { message: "Server error" },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async changePassword(data) {
    try {
      const { currentPassword, newPassword } = data;

      if (!currentPassword || !newPassword) {
        return {
          success: false,
          data: { message: "Current and new password required" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const user = await User.findOne({ loginEmail: data.email });

      if (!user) {
        return {
          success: false,
          data: { message: "User not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      const isValid = await argon2.verify(user.loginPassword, currentPassword);

      if (!isValid) {
        return {
          success: false,
          data: { message: "Current password incorrect" },
          statusCode: StatusCodes.UNAUTHORIZED,
        };
      }

      user.loginPassword = await argon2.hash(newPassword);
      await user.save();

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: { message: "Password changed successfully" },
      };
    } catch (err) {
      return {
        success: false,
        data: { message: "Server error" },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async forgotPassword(data) {
    try {
      const { loginEmail } = data;

      if (!loginEmail) {
        return {
          success: false,
          data: { message: "Email required" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const email = loginEmail.toLowerCase().trim();

      const user = await User.findOne({
        loginEmail: email,
        status: STATUS.ACTIVE,
      });

      if (!user) {
        return {
          success: false,
          data: { message: "User not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      // Generate 6 digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      user.resetPassword = true; // Important flag
      user.resetOtp = await argon2.hash(otp);
      user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      await user.save();

      await sendMail({
        to: user.loginEmail,
        subject: "Password Reset OTP",
        html: `<p>Your password reset OTP is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
      });

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: { message: "Reset OTP sent to email" },
      };
    } catch (err) {
      return {
        success: false,
        data: { message: "Server error" },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
