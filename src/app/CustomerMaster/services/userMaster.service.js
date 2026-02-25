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
import { buildPermissionsFromRequest } from "../../../utils/permission.util.js";

export class UserMasterService {
  async create(data, loggedInUser) {
    try {
      const {
        userName,
        loginEmail,
        loginPassword,
        userTypeId,
        position,
        mobile,
      } = data;

      if (!userName || !loginEmail || !loginPassword) {
        return {
          success: false,
          data: { errors: "Required fields missing" },
          statusCode: StatusCodes.BAD_REQUEST,
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

      if (userTypeId) {
        const role = await UserType.findOne({
          _id: userTypeId,
        }).lean();

        if (!role) {
          return {
            success: false,
            data: { message: "Invalid user type" },
            statusCode: 400,
          };
        }
      }

      const userId = await generateUserId(customer.companyName);

      const hashedPassword = await argon2.hash(loginPassword);

      // Build Permissions
      let finalPermissions;

      // If frontend sends permissions → normalize it
      if (data.permissions && Array.isArray(data.permissions)) {
        finalPermissions = buildPermissionsFromRequest(data.permissions);
      } else {
        // Otherwise inherit from role (UserType)
        finalPermissions = role.permissions || [];
      }

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
        permissions: finalPermissions,
        createdBy: loggedInUser.userName,
      });

      try {
        await sendMail({
          to: email,
          subject: "Your SmartBin Account Credentials",
          html: `
      <h3>Welcome to SmartBin</h3>
      <p>Hello ${userName},</p>
      <p>Your account has been created successfully.</p>
      <p><b>Login Email:</b> ${email}</p>
      <p><b>Password:</b> ${loginPassword}</p>
      <p>Please login and change your password immediately.</p>
      <br/>
      <p>Regards,<br/>SmartBin Team</p>
    `,
        });
      } catch (mailError) {
        console.error("Email sending failed:", mailError.message);
        // Do NOT block user creation if email fails
      }

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
      const customerObjectId = new mongoose.Types.ObjectId(
        loggedInUser.customerId,
      );
      const filter = {
        customerId: customerObjectId,
        status: { $in: [STATUS.ACTIVE, STATUS.INACTIVE] },
        isMainAdmin: { $ne: true }, // Always exclude main admin
      };

      if (id) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return {
            success: false,
            data: { message: "Invalid user ID" },
            statusCode: 400,
          };
        }

        filter._id = new mongoose.Types.ObjectId(id);
      }

      // Get users
      const users = await User.find(filter, {
        loginPassword: 0,
        refreshToken: 0,
      })
        .populate("userTypeId", "userTypeName")
        .lean();

      if (id && users.length === 0) {
        return {
          success: false,
          data: { message: "User not found" },
          statusCode: 404,
        };
      }

      // Get role counts using aggregation
      const roleCounts = await User.aggregate([
        { $match: filter },
        { $group: { _id: "$userTypeId", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "usertypes",
            localField: "_id",
            foreignField: "_id",
            as: "role",
          },
        },
        { $unwind: "$role" },
        {
          $project: {
            _id: 0,
            role: "$role.userTypeName",
            count: 1,
          },
        },
      ]);

      return {
        success: true,
        statusCode: 200,
        data: {
          users: id ? users[0] : users,
          roleCounts,
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

      /* ---------------- EMAIL UPDATE ---------------- */
      if (data.loginEmail) {
        const email = data.loginEmail.toLowerCase();

        const exists = await User.exists({
          loginEmail: email,
          _id: { $ne: id },
          status: STATUS.ACTIVE,
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

      /* ---------------- USER TYPE VALIDATION ---------------- */
      if (data.userTypeId) {
        if (!mongoose.Types.ObjectId.isValid(data.userTypeId)) {
          return {
            success: false,
            data: { errors: "Invalid userTypeId" },
            statusCode: 400,
          };
        }

        const role = await UserType.findById(data.userTypeId).lean();

        if (!role) {
          return {
            success: false,
            data: { errors: "UserType not found" },
            statusCode: 404,
          };
        }

        updateData.userTypeId = data.userTypeId;
      }

      /* ---------------- BASIC FIELDS ---------------- */
      const allowed = ["userName", "position", "mobile", "status"];

      for (let key of allowed) {
        if (data[key] !== undefined) {
          updateData[key] = data[key];
        }
      }

      /* ---------------- PERMISSIONS ---------------- */
      if (data.permissions && Array.isArray(data.permissions)) {
        updateData.permissions = buildPermissionsFromRequest(data.permissions);
      }

      const updated = await User.findOneAndUpdate(
        {
          _id: id,
          customerId: loggedInUser.customerId,
          status: { $in: [STATUS.ACTIVE, STATUS.INACTIVE] },
        },
        updateData,
        {
          returnDocument: "after",
          projection: { loginPassword: 0 },
        },
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
          status: { $in: [STATUS.ACTIVE, STATUS.INACTIVE] },
        },
        {
          status: STATUS.DELETED,
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
      console.log(data);
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

      // Always generate OTP after password validation
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otp1 = otp;

      user.otp = await argon2.hash(otp);
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await user.save();

      try {
        await sendMail({
          to: user.loginEmail,
          subject: "Login OTP Verification",
          html: `
          <p>Hello ${user.userName},</p>
          <p>Your login OTP is <b>${otp}</b>.</p>
          <p>This OTP is valid for 10 minutes.</p>
        `,
        });
      } catch (mailError) {
        console.error("Mail Error:", mailError.message);
      }

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: {
          message: "OTP sent to registered email",
          email: user.loginEmail,
          otp: otp1,
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

      // Clear OTP after successful verification
      user.otp = undefined;
      user.otpExpiry = undefined;

      const tokens = getJwtToken({
        _id: user._id,
        role: user.userTypeId.userTypeName,
        customerId: user.customerId,
        userName: user.userName,
        url: user.url,
        permissions: user.permissions,
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
          isFirstLogin: user.isFirstLogin,
        },
      };
    } catch (err) {
      return {
        success: false,
        data: { message: "Server error", error: err.message },
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

      // Generate new 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      user.otp = await argon2.hash(otp);
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await user.save();

      try {
        await sendMail({
          to: user.loginEmail,
          subject: "Your OTP Code",
          html: `
          <p>Hello ${user.userName},</p>
          <p>Your OTP is <b>${otp}</b>.</p>
          <p>This OTP is valid for 10 minutes.</p>
        `,
        });
      } catch (mailError) {
        console.error("Mail Error:", mailError.message);
      }

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: {
          message: "OTP sent successfully",
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
      user.isFirstLogin = false;
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

  async resetPassword(data) {
    try {
      const { loginEmail, otp, newPassword } = data;

      if (!loginEmail || !otp || !newPassword) {
        return {
          success: false,
          data: { message: "Email, OTP and new password required" },
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

      user.loginPassword = await argon2.hash(newPassword);
      user.resetOtp = undefined;
      user.resetOtpExpiry = undefined;
      user.refreshToken = undefined; // force logout everywhere

      await user.save();

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: { message: "Password reset successfully" },
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
