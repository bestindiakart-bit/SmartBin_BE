import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { ItemMaster } from "../models/itemMaster.model.js";
import { STATUS } from "../../../constants/status.js";
import { logActivity } from "../../../utils/activity.util.js";
import path from "path";
import fs from "fs";

export class ItemMasterService {
  async create(data, loggedInUser) {
    try {
      // -------- 0. Owner check --------
      if (!loggedInUser.owner) {
        return {
          success: false,
          data: { message: "Only owner users can create items" },
          statusCode: 403,
        };
      }

      const {
        itemName,
        itemCategory,
        partNumber,
        itemDescription,
        weightPerUnit,
        costPerUnit,
        remarks,
        manufacturingTime,
        itemSBQ,
        outerBoxQuantity,
        itemHSNCode,
        warehouseStock,
        warehouseSafetyStock,
        warehouseROL,
        warehouseStockUrl,
        isLocal,
        status,
        itemImages,
        itemDrawing,
      } = data;

      // -------- 1. Required Validation --------
      if (!itemName?.trim()) {
        return {
          success: false,
          data: { message: "Item name required" },
          statusCode: 400,
        };
      }

      // -------- 2. Validate itemCategory ObjectId --------
      if (itemCategory && !mongoose.Types.ObjectId.isValid(itemCategory)) {
        return {
          success: false,
          data: { message: "Invalid item category ID" },
          statusCode: 400,
        };
      }

      // -------- 3. Unique Check (customer + itemName) --------
      const exists = await ItemMaster.exists({
        customerId: loggedInUser.customerId, // always from login user
        itemName: itemName.trim(),
      });

      if (exists) {
        return {
          success: false,
          data: { message: "Item already exists" },
          statusCode: 409,
        };
      }

      // -------- 4. Generate Item ID --------
      const lastItem = await ItemMaster.findOne(
        { customerId: loggedInUser.customerId }, // ensure it's per customer
        { itemId: 1 },
        { sort: { createdAt: -1 } },
      ).lean();

      let nextNumber = 1;
      if (lastItem?.itemId) {
        const lastNum = parseInt(lastItem.itemId.split("-")[1], 10);
        nextNumber = isNaN(lastNum) ? 1 : lastNum + 1;
      }
      const itemId = `SBITEM-${String(nextNumber).padStart(3, "0")}`;

      // -------- 5. Create Item --------
      const item = await ItemMaster.create({
        customerId: loggedInUser.customerId, // owner customer
        itemId,
        itemName: itemName.trim(),
        itemCategory,
        partNumber: partNumber?.trim(),
        itemDescription: itemDescription?.trim(),
        weightPerUnit: weightPerUnit ? Number(weightPerUnit) : undefined,
        costPerUnit: costPerUnit ? Number(costPerUnit) : undefined,
        remarks: remarks?.trim(),
        manufacturingTime: manufacturingTime
          ? Number(manufacturingTime)
          : undefined,
        itemSBQ: itemSBQ ? Number(itemSBQ) : undefined,
        outerBoxQuantity: outerBoxQuantity ? Number(outerBoxQuantity) : 0,
        itemHSNCode: itemHSNCode?.trim(),
        warehouseStock: warehouseStock ? Number(warehouseStock) : 0,
        warehouseSafetyStock: warehouseSafetyStock
          ? Number(warehouseSafetyStock)
          : 0,
        warehouseROL: warehouseROL ? Number(warehouseROL) : 0,
        warehouseStockUrl: warehouseStockUrl?.trim(),
        isLocal: isLocal === true || isLocal === "true",
        status: status ?? STATUS.ACTIVE,
        itemImages: Array.isArray(itemImages) ? itemImages : [],
        itemDrawing: itemDrawing || null,
        createdBy: loggedInUser.userName,
      });

      // -------- 6. Log Activity --------
      await logActivity({
        userId: loggedInUser._id,
        entityType: "ItemMaster",
        entityId: item._id,
        actionType: "Created",
        description: `${loggedInUser.userName} created item ${item.itemId}`,
      });

      // -------- 7. Return --------
      return {
        success: true,
        statusCode: 201,
        data: {
          _id: item._id,
          itemId: item.itemId,
          itemName: item.itemName,
        },
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: 500,
      };
    }
  }

  async getAll(query, loggedInUser) {
    try {
      const { page = 1, limit = 10, search, itemCategory, status } = query;

      const filter = {
        customerId: loggedInUser.customerId,
      };

      // Status filter
      if (status !== undefined) {
        filter.status = Number(status);
      } else {
        filter.status = { $in: [STATUS.ACTIVE, STATUS.INACTIVE] }; // default to show active and inactive
      }

      // Search filter
      if (search) {
        filter.$or = [
          { itemName: { $regex: search, $options: "i" } },
          { partNumber: { $regex: search, $options: "i" } },
        ];
      }

      // Item Category filter
      if (itemCategory && mongoose.Types.ObjectId.isValid(itemCategory)) {
        filter.itemCategory = itemCategory;
      }

      const pageNumber = Number(page);
      const pageSize = Number(limit);
      const skip = (pageNumber - 1) * pageSize;

      const totalRecords = await ItemMaster.countDocuments(filter);

      const items = await ItemMaster.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean();

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: {
          totalRecords,
          totalPages: Math.ceil(totalRecords / pageSize),
          currentPage: pageNumber,
          items,
        },
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async getById(id, loggedInUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          data: { message: "Invalid ID" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const item = await ItemMaster.findOne({
        _id: id,
        customerId: loggedInUser.customerId,
      }).lean();

      if (!item) {
        return {
          success: false,
          data: { message: "Item not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: item,
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async update(id, data, loggedInUser) {
    try {
      // 1️⃣ Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          data: { message: "Invalid item ID" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      // 2️⃣ Find Existing Item (Customer Isolation)
      const existingItem = await ItemMaster.findOne({
        _id: id,
        customerId: loggedInUser.customerId,
        // status: { $ne: STATUS.INACTIVE STATUS.},
      });

      if (!existingItem) {
        return {
          success: false,
          data: { message: "Item not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      // 3️⃣ Validate itemCategory if provided
      if (
        data.itemCategory &&
        !mongoose.Types.ObjectId.isValid(data.itemCategory)
      ) {
        return {
          success: false,
          data: { message: "Invalid item category ID" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      // 4️⃣ Prepare Update Object
      const updateData = {
        updatedBy: loggedInUser.userName,
      };

      const numberFields = [
        "weightPerUnit",
        "costPerUnit",
        "manufacturingTime",
        "itemSBQ",
        "price",
        "warehouseStock",
        "warehouseSafetyStock",
      ];

      const allowedFields = [
        "itemName",
        "itemCategory",
        "partNumber",
        "itemDescription",
        "remarks",
        "itemHSNCode",
        "warehouseStockUrl",
        "status",
      ];

      // 5️⃣ Handle Fields
      for (let key in data) {
        if (data[key] === undefined) continue;

        if (numberFields.includes(key)) {
          updateData[key] = Number(data[key]);
        } else if (key === "isLocal") {
          updateData[key] = data[key] === true || data[key] === "true";
        } else if (allowedFields.includes(key)) {
          updateData[key] =
            typeof data[key] === "string" ? data[key].trim() : data[key];
        }
      }

      // Handle Images (Add Without Removing Old)
      if (Array.isArray(data.itemImages) && data.itemImages.length > 0) {
        updateData.itemImages = [
          ...new Set([...(existingItem.itemImages || []), ...data.itemImages]),
        ];
      }

      // Handle Drawing (Replace Old If New Uploaded)
      if (data.itemDrawing) {
        updateData.itemDrawing = data.itemDrawing;
      }

      // Update Document
      const updatedItem = await ItemMaster.findByIdAndUpdate(id, updateData, {
        new: true,
      }).lean();

      // Log Activity
      await logActivity({
        userId: loggedInUser._id,
        entityType: "ItemMaster",
        entityId: updatedItem._id,
        actionType: "Updated",
        description: `${loggedInUser.userName} updated item ${updatedItem.itemId}`,
      });

      // Return Response
      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: updatedItem,
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async delete(id, loggedInUser) {
    try {
      const deleted = await ItemMaster.findOneAndUpdate(
        {
          _id: id,
          customerId: loggedInUser.customerId,
          status: { $in: [STATUS.ACTIVE, STATUS.INACTIVE] },
        },
        { status: STATUS.INACTIVE },
        { new: true },
      );

      if (!deleted) {
        return {
          success: false,
          data: { message: "Item not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: { message: "Item deleted successfully" },
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async deleteImages(id, imagesToDelete, loggedInUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          data: { message: "Invalid item ID" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      if (!Array.isArray(imagesToDelete) || imagesToDelete.length === 0) {
        return {
          success: false,
          data: { message: "Images array required" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const item = await ItemMaster.findOne({
        _id: id,
        customerId: loggedInUser.customerId,
        status: { $ne: STATUS.INACTIVE },
      });

      if (!item) {
        return {
          success: false,
          data: { message: "Item not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      const existingImages = item.itemImages || [];

      const imagesToActuallyDelete = existingImages.filter((img) =>
        imagesToDelete.includes(img),
      );

      if (imagesToActuallyDelete.length === 0) {
        return {
          success: false,
          data: { message: "No matching images found to delete" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      //  Delete from local storage
      for (let imageUrl of imagesToActuallyDelete) {
        try {
          const filename = imageUrl.split("/").pop();
          const filePath = path.join(__dirname, "../../uploads", filename);

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {
          console.error("File delete error:", err.message);
        }
      }

      // Remove from DB
      item.itemImages = existingImages.filter(
        (img) => !imagesToDelete.includes(img),
      );

      item.updatedBy = loggedInUser.userName;
      await item.save();

      await logActivity({
        userId: loggedInUser._id,
        entityType: "ItemMaster",
        entityId: item._id,
        actionType: "Image Deleted",
        description: `${loggedInUser.userName} deleted ${imagesToActuallyDelete.length} image(s) from item ${item.itemId}`,
      });

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: {
          _id: item._id,
          itemId: item.itemId,
          itemImages: item.itemImages,
        },
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
