import { User } from "../app/CustomerMaster/models/userMaster.model.js";
import { STATUS } from "../constants/status.js";

export const authorize = (moduleName, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.decodedToken.data._id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Fetch user with permissions
      const user = await User.findById(userId)
        .select("permissions status")
        .lean();

      if (!user || user.status !== STATUS.ACTIVE) {
        return res.status(403).json({ message: "User inactive or not found" });
      }

      // Find module permission
      const modulePermission = user.permissions.find(
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
