import { User } from "../app/CustomerMaster/models/userMaster.model.js";

export async function generateUserId(companyName) {
  // Remove spaces & special characters
  const cleaned = companyName
    .replace(/[^a-zA-Z0-9]/g, "") // remove special chars
    .toUpperCase();

  // Ensure minimum 4 characters
  const prefix =
    cleaned.length >= 4 ? cleaned.substring(0, 4) : cleaned.padEnd(4, "X"); // pad with X if less than 4

  const last = await User.findOne(
    { userId: { $regex: new RegExp(`^${prefix}-USER-`) } },
    { userId: 1 },
  )
    .sort({ userId: -1 })
    .lean();

  const next = last ? parseInt(last.userId.split("-")[2]) + 1 : 1;

  return `${prefix}-USER-${String(next).padStart(3, "0")}`;
}
