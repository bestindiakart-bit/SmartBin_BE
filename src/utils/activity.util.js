import { ActivityLog } from "../app/CustomerMaster/models/activity.model.js";

export const logActivity = async ({
  userId,
  entityType,
  entityId,
  actionType,
  description,
}) => {
  try {
    await ActivityLog.create({
      userId,
      entityType,
      entityId,
      actionType,
      description,
    });
  } catch (err) {
    console.error("Activity Log Error:", err.message);
  }
};
