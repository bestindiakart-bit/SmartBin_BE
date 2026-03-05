import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Warehouse } from "../models/warehouse.model.js";
import { User } from "../../CustomerMaster/models/userMaster.model.js";
import { STATUS } from "../../../constants/status.js";
import { logActivity } from "../../../utils/activity.util.js";
import { ItemMaster } from "../../Item-Master/models/itemMaster.model.js";
import { Customer } from "../../CustomerMaster/models/customerMaster.model.js";
import { WarehouseTransaction } from "../models/warehousetransation.model.js";

export class WarehouseService {
  async generateWarehouseId(customerId) {
    const lastWarehouse = await Warehouse.findOne(
      {
        customerId,
        warehouseId: { $regex: /^SBWAREHOUSE-\d+$/ },
      },
      { warehouseId: 1 },
    )
      .sort({ createdAt: -1 }) // safer than sorting string
      .lean();

    let nextNumber = 1;

    if (lastWarehouse?.warehouseId) {
      const currentNumber = parseInt(
        lastWarehouse.warehouseId.split("-")[1],
        10,
      );

      if (!isNaN(currentNumber)) {
        nextNumber = currentNumber + 1;
      }
    }

    return `SBWAREHOUSE-${String(nextNumber).padStart(3, "0")}`;
  }

  /* ============================================================
     Create Warehouse
  ============================================================ */
  async create(data, loggedInUser) {
    try {
      /* -------- 0. Owner check -------- */
      if (!loggedInUser.owner) {
        return {
          success: false,
          data: { message: "Only owner users can create a warehouse" },
          statusCode: 403,
        };
      }

      /* -------- 1. Validate Customer (Optional override) -------- */
      if (data.customerId !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(data.customerId)) {
          return {
            success: false,
            data: { message: "Invalid customer ID" },
            statusCode: 400,
          };
        }

        const customerExists = await Customer.exists({
          _id: data.customerId,
        });

        if (!customerExists) {
          return {
            success: false,
            data: { message: "Customer not found" },
            statusCode: 404,
          };
        }
      }

      const { warehouseName, warehouseLocation, items } = data;

      /* -------- 2. Required validation -------- */
      if (!warehouseName || !warehouseName.trim()) {
        return {
          success: false,
          data: { message: "Warehouse name required" },
          statusCode: 400,
        };
      }

      if (!Array.isArray(items) || items.length === 0) {
        return {
          success: false,
          data: { message: "At least one item is required" },
          statusCode: 400,
        };
      }

      /* -------- 3. Generate Warehouse ID -------- */
      const warehouseId = await this.generateWarehouseId(data.customerId);

      /* -------- 4. Validate Items -------- */
      const itemIds = [];

      for (const item of items) {
        if (!item.itemMasterId) {
          return {
            success: false,
            data: { message: "itemMasterId is required" },
            statusCode: 400,
          };
        }

        if (
          item.warehouseLimit == null ||
          item.warehouseReorderLevel == null ||
          item.warehouseSafeStock == null ||
          item.currentStock == null
        ) {
          return {
            success: false,
            data: {
              message:
                "warehouseLimit, warehouseReorderLevel, warehouseSafeStock and currentStock are required",
            },
            statusCode: 400,
          };
        }

        if (
          item.warehouseLimit < 0 ||
          item.warehouseReorderLevel < 0 ||
          item.warehouseSafeStock < 0 ||
          item.currentStock < 0
        ) {
          return {
            success: false,
            data: { message: "Stock values cannot be negative" },
            statusCode: 400,
          };
        }

        if (item.currentStock > item.warehouseLimit) {
          return {
            success: false,
            data: {
              message: "Current stock cannot exceed warehouse limit",
            },
            statusCode: 400,
          };
        }

        if (itemIds.includes(item.itemMasterId.toString())) {
          return {
            success: false,
            data: { message: "Duplicate item in request" },
            statusCode: 400,
          };
        }

        itemIds.push(item.itemMasterId.toString());

        const exists = await ItemMaster.exists({
          _id: item.itemMasterId,
        });

        if (!exists) {
          return {
            success: false,
            data: { message: `Item not found: ${item.itemMasterId}` },
            statusCode: 404,
          };
        }
      }

      /* -------- 5. Create Warehouse -------- */
      const warehouse = await Warehouse.create({
        customerId: data.customerId,
        warehouseId,
        warehouseName: warehouseName.trim(),
        warehouseLocation: warehouseLocation?.trim(),
        items: items.map((item) => ({
          itemMasterId: item.itemMasterId,
          warehouseLimit: Number(item.warehouseLimit),
          warehouseReorderLevel: Number(item.warehouseReorderLevel),
          warehouseSafeStock: Number(item.warehouseSafeStock),
          currentStock: Number(item.currentStock), // ✅ NEW FIELD
          supplerName: item.supplerName?.trim(),
          lastTransationQuantity:
            item.lastTransationQuantity != null
              ? Number(item.lastTransationQuantity)
              : null,
          lastTransactionDate: item.lastTransactionDate
            ? new Date(item.lastTransactionDate)
            : null,
        })),
        createdBy: loggedInUser.userName,
      });

      /* -------- 6. Log Activity -------- */
      await logActivity({
        userId: loggedInUser._id,
        entityType: "Warehouse",
        entityId: warehouse._id,
        actionType: "Created",
        description: `${loggedInUser.userName} created warehouse ${warehouse.warehouseName}`,
      });

      /* -------- 7. Success -------- */
      return {
        success: true,
        statusCode: 201,
        data: warehouse,
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
      const filter = {
        status: { $in: [STATUS.ACTIVE, STATUS.INACTIVE] },
      };

      if (query.id) {
        filter._id = query.id;
      }

      if (!loggedInUser.owner) {
        filter.customerId = loggedInUser.customerId._id;
      }

      const warehouses = await Warehouse.find(filter)
        .populate({
          path: "customerId",
          select: "customerName companyName customerId",
        })
        .populate({
          path: "items.itemMasterId",
          select: "itemName partNumber itemDescription",
        })

        .sort({ createdAt: -1 })
        .lean();

      await logActivity({
        userId: loggedInUser._id,
        entityType: "Warehouse",
        actionType: "Read",
        description: `${loggedInUser._id} viewed warehouse list`,
      });

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: warehouses,
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
      /* -------- 0. Owner check -------- */
      if (!loggedInUser.owner) {
        return {
          success: false,
          data: { message: "Only owner users can update a warehouse" },
          statusCode: 403,
        };
      }

      /* -------- 1. Validate Warehouse ID -------- */
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          data: { message: "Invalid warehouse ID" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      /* -------- 2. Find Warehouse -------- */
      const warehouse = await Warehouse.findOne({
        _id: id,
        status: { $in: [STATUS.ACTIVE, STATUS.INACTIVE] },
      });

      if (!warehouse) {
        return {
          success: false,
          data: { message: "Warehouse not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      /* -------- 3. Update Customer (NEW) -------- */
      if (data.customerId !== undefined) {
        if (!mongoose.Types.ObjectId.isValid(data.customerId)) {
          return {
            success: false,
            data: { message: "Invalid customer ID" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }

        const customerExists = await Customer.exists({
          _id: data.customerId,
        });

        if (!customerExists) {
          return {
            success: false,
            data: { message: "Customer not found" },
            statusCode: StatusCodes.NOT_FOUND,
          };
        }

        // Prevent duplicate warehouse for same customer
        const duplicate = await Warehouse.findOne({
          _id: { $ne: warehouse._id },
          customerId: data.customerId,
          warehouseName: data.warehouseName || warehouse.warehouseName,
          warehouseId: warehouse.warehouseId,
        });

        if (duplicate) {
          return {
            success: false,
            data: {
              message:
                "Warehouse with same name and ID already exists for this customer",
            },
            statusCode: StatusCodes.CONFLICT,
          };
        }

        warehouse.customerId = data.customerId;
      }

      /* -------- 4. Basic Field Updates -------- */
      if (data.warehouseName !== undefined) {
        if (!data.warehouseName.trim()) {
          return {
            success: false,
            data: { message: "Warehouse name cannot be empty" },
            statusCode: 400,
          };
        }
        warehouse.warehouseName = data.warehouseName.trim();
      }

      if (data.warehouseLocation !== undefined) {
        warehouse.warehouseLocation = data.warehouseLocation?.trim();
      }

      if (data.status !== undefined) {
        warehouse.status = data.status;
      }

      /* -------- 5. Add / Update Items -------- */
      if (Array.isArray(data.items)) {
        const itemIds = [];

        for (const item of data.items) {
          if (!item.itemMasterId) {
            return {
              success: false,
              data: { message: "itemMasterId is required" },
              statusCode: 400,
            };
          }

          if (
            item.warehouseLimit == null ||
            item.warehouseReorderLevel == null ||
            item.warehouseSafeStock == null
          ) {
            return {
              success: false,
              data: {
                message:
                  "warehouseLimit, warehouseReorderLevel and warehouseSafeStock are required",
              },
              statusCode: 400,
            };
          }

          if (item.warehouseLimit < 0 || item.warehouseSafeStock < 0) {
            return {
              success: false,
              data: { message: "Stock values cannot be negative" },
              statusCode: 400,
            };
          }

          if (itemIds.includes(item.itemMasterId.toString())) {
            return {
              success: false,
              data: { message: "Duplicate item in request" },
              statusCode: 400,
            };
          }

          itemIds.push(item.itemMasterId.toString());

          const exists = await ItemMaster.exists({
            _id: item.itemMasterId,
          });

          if (!exists) {
            return {
              success: false,
              data: { message: `Item not found: ${item.itemMasterId}` },
              statusCode: 404,
            };
          }

          const existingItem = warehouse.items.find(
            (i) => i.itemMasterId.toString() === item.itemMasterId.toString(),
          );

          if (existingItem) {
            existingItem.warehouseLimit = Number(item.warehouseLimit);
            existingItem.warehouseReorderLevel = Number(
              item.warehouseReorderLevel,
            );
            existingItem.warehouseSafeStock = Number(item.warehouseSafeStock);
            existingItem.supplerName = item.supplerName?.trim();
            existingItem.lastTransationQuantity =
              item.lastTransationQuantity != null
                ? Number(item.lastTransationQuantity)
                : null;
            existingItem.lastTransactionDate = item.lastTransactionDate
              ? new Date(item.lastTransactionDate)
              : null;
          } else {
            warehouse.items.push({
              itemMasterId: item.itemMasterId,
              warehouseLimit: Number(item.warehouseLimit),
              warehouseReorderLevel: Number(item.warehouseReorderLevel),
              warehouseSafeStock: Number(item.warehouseSafeStock),
              supplerName: item.supplerName?.trim(),
              lastTransationQuantity:
                item.lastTransationQuantity != null
                  ? Number(item.lastTransationQuantity)
                  : null,
              lastTransactionDate: item.lastTransactionDate
                ? new Date(item.lastTransactionDate)
                : null,
            });
          }
        }
      }

      /* -------- 6. Update metadata -------- */
      warehouse.updatedBy = loggedInUser.userName;

      await warehouse.save();

      /* -------- 7. Log Activity -------- */
      await logActivity({
        userId: loggedInUser._id,
        entityType: "Warehouse",
        entityId: warehouse._id,
        actionType: "Updated",
        description: `${loggedInUser.userName} updated warehouse ${warehouse.warehouseName}`,
      });

      /* -------- 8. Success -------- */
      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: warehouse,
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async deleteWarehouse(id, loggedInUser) {
    try {
      // ✅ 1. Validate ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          data: { message: "Invalid warehouse ID" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      // ✅ 2. Build Filter Based On Role
      let filter = { _id: id };

      // If NOT owner → restrict by customerId
      if (!loggedInUser?.owner) {
        filter.customerId = loggedInUser.customerId._id;
      }

      // ✅ 3. Soft Delete (Recommended)
      const warehouse = await Warehouse.findOneAndUpdate(
        filter,
        {
          status: STATUS.DELETED, // Proper soft delete
          updatedBy: loggedInUser.userName,
        },
        { new: true },
      );

      if (!warehouse) {
        return {
          success: false,
          data: { message: "Warehouse not found or access denied" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: { message: "Warehouse deleted successfully" },
      };
    } catch (err) {
      return {
        success: false,
        data: { message: err.message },
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      };
    }
  }

  async warehouseByItem(query, loggedInUser) {
    try {
      const { itemMasterId, customerId } = query;

      // ===============================
      // ✅ Validate itemMasterId
      // ===============================
      if (!itemMasterId || !mongoose.Types.ObjectId.isValid(itemMasterId)) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: { message: "Valid itemMasterId is required" },
        };
      }

      // ===============================
      // ✅ Extract Token Data (YOUR STRUCTURE)
      // ===============================
      const tokenData = loggedInUser;

      if (!tokenData) {
        return {
          success: false,
          statusCode: StatusCodes.UNAUTHORIZED,
          data: { message: "Invalid token data" },
        };
      }

      const isOwner = tokenData.owner === true;
      const tokenCustomerId = tokenData.customerId?._id;

      // ===============================
      // ✅ Build Filter
      // ===============================
      const filter = {
        status: STATUS.ACTIVE,
        // Safe match (handles ObjectId + string old data)
        "items.itemMasterId": {
          $in: [new mongoose.Types.ObjectId(itemMasterId), itemMasterId],
        },
      };

      // ===============================
      // ✅ Owner vs Normal User
      // ===============================
      if (isOwner) {
        // Owner can optionally filter by customer
        if (customerId) {
          if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return {
              success: false,
              statusCode: StatusCodes.BAD_REQUEST,
              data: { message: "Invalid customerId" },
            };
          }

          filter.customerId = new mongoose.Types.ObjectId(customerId);
        }
      } else {
        // Normal user → restrict to token customer
        if (!tokenCustomerId) {
          return {
            success: false,
            statusCode: StatusCodes.FORBIDDEN,
            data: { message: "Customer not found in token" },
          };
        }

        filter.customerId = new mongoose.Types.ObjectId(tokenCustomerId);
      }

      // ===============================
      // ✅ Query (Only One Warehouse)
      // ===============================
      const warehouse = await Warehouse.findOne(filter)
        .select("warehouseId warehouseName customerId _id")
        .lean();

      if (!warehouse) {
        return {
          success: false,
          statusCode: StatusCodes.NOT_FOUND,
          data: { message: "Warehouse not found for this item" },
        };
      }

      // ===============================
      // ✅ Success Response
      // ===============================
      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: warehouse,
      };
    } catch (err) {
      return {
        success: false,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        data: { message: err.message },
      };
    }
  }

  async warehouseTransactionByItem(query, loggedInUser) {    
    try {
      const { itemMasterId, customerId } = query;

      // ===============================
      // ✅ Validate itemMasterId
      // ===============================
      if (!itemMasterId || !mongoose.Types.ObjectId.isValid(itemMasterId)) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: { message: "Valid itemMasterId is required" },
        };
      }

      const tokenData = loggedInUser;

      if (!tokenData) {
        return {
          success: false,
          statusCode: StatusCodes.UNAUTHORIZED,
          data: { message: "Invalid token data" },
        };
      }

      const isOwner = tokenData.owner === true;
      const tokenCustomerId = tokenData.customerId?._id;

      // ===============================
      // ✅ Build Warehouse Filter (for security)
      // ===============================
      const warehouseFilter = {
        status: STATUS.ACTIVE,
        "items.itemMasterId": new mongoose.Types.ObjectId(itemMasterId),
      };

      if (isOwner) {
        if (customerId) {
          if (!mongoose.Types.ObjectId.isValid(customerId)) {
            return {
              success: false,
              statusCode: StatusCodes.BAD_REQUEST,
              data: { message: "Invalid customerId" },
            };
          }

          warehouseFilter.customerId = new mongoose.Types.ObjectId(customerId);
        }
      } else {
        if (!tokenCustomerId) {
          return {
            success: false,
            statusCode: StatusCodes.FORBIDDEN,
            data: { message: "Customer not found in token" },
          };
        }

        warehouseFilter.customerId = new mongoose.Types.ObjectId(
          tokenCustomerId,
        );
      }

      // ===============================
      // ✅ Get allowed warehouse IDs
      // ===============================
      const warehouses = await Warehouse.find(warehouseFilter)
        .select("_id")
        .lean();

      if (!warehouses.length) {
        return {
          success: false,
          statusCode: StatusCodes.NOT_FOUND,
          data: { message: "No warehouse found for this item" },
        };
      }

      const warehouseIds = warehouses.map((w) => w._id);

      // ===============================
      // ✅ Get Item Details
      // ===============================
      const itemDetails = await ItemMaster.findById(itemMasterId)
        .select("itemDescription itemImages")
        .lean();

      if (!itemDetails) {
        return {
          success: false,
          statusCode: StatusCodes.NOT_FOUND,
          data: { message: "Item not found" },
        };
      }

      // ===============================
      // ✅ Get Transaction History
      // ===============================
      const transactions = await WarehouseTransaction.find({
        itemMasterId: new mongoose.Types.ObjectId(itemMasterId),
        warehouseId: { $in: warehouseIds },
      })
        .select(
          "transactionType quantity itemMasterId transactionDate warehouseId",
        )
        .sort({ transactionDate: -1 })
        .lean();

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: { itemDetails, transactions },
      };
    } catch (err) {
      return {
        success: false,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        data: { message: err.message },
      };
    }
  }
}
