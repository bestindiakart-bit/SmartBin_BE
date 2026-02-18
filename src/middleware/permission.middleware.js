import mongoose from "mongoose";
import { UserType } from "../app/CustomerMaster/models/userType.js";
import { STATUS } from "../constants/status.js";

export const authorize = (moduleName, action) => {
  console.log("Authorize middleware file loaded");

  return async (req, res, next) => {
    const userTypeId = req.decodedToken.data.userTypeId._id;

    try {
      const userType = await UserType.findById(userTypeId).lean();

      if (!userType) {
        return res.status(403).json({ message: "Invalid user type" });
      }

      const modulePermission = userType.permissions.find(
        (p) => p.module === moduleName,
      );

      if (!modulePermission || !modulePermission[action]) {
        return res.status(403).json({ message: "Permission denied" });
      }

      next();
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  };
};
