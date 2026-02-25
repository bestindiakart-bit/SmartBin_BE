import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { Warehouse } from "../models/warehouse.model.js";
import { User } from "../../CustomerMaster/models/userMaster.model.js";
import { STATUS } from "../../../constants/status.js";
import { logActivity } from "../../../utils/activity.util.js";
import { ItemMaster } from "../../Item-Master/models/itemMaster.model.js";

export class WarehouseService {
  async create(data, loggedInUser) {
<<<<<<< HEAD
    console.log("data===>",data);
    
=======
    console.log("data", data);
>>>>>>> 941037d (Warehouse Created)
    try {
      const { warehouseName, warehouseLocation, items = [] } = data;

      if (!warehouseName?.trim()) {
        return {
          success: false,
          data: { message: "Warehouse name is required" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      if (!Array.isArray(items) || items.length === 0) {
        return {
          success: false,
          data: { message: "At least one item is required" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      /* ----------------------------
       2. Check duplicate itemMasterId in request
    ----------------------------- */
      const itemIds = items.map((i) => i.itemMasterId.toString());
      const uniqueItemIds = new Set(itemIds);

      if (uniqueItemIds.size !== itemIds.length) {
        return {
          success: false,
          data: { message: "Duplicate itemMasterId in request" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      /* ----------------------------
       3. Validate each item input
    ----------------------------- */
      for (const item of items) {
        if (!item.itemMasterId) {
          return {
            success: false,
            data: { message: "itemMasterId is required for all items" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }

        if (item.warehouseLimit == null || item.warehouseLimit < 0) {
          return {
            success: false,
            data: { message: "Valid warehouseLimit required" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }

        if (
          item.warehouseReorderLevel == null ||
          item.warehouseReorderLevel < 0
        ) {
          return {
            success: false,
            data: { message: "Valid warehouseReorderLevel required" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }
      }

      /* ----------------------------
       4. Fetch Items From DB
    ----------------------------- */
      const dbItems = await ItemMaster.find({
        _id: { $in: itemIds },
        customerId: loggedInUser.customerId,
        status: STATUS.ACTIVE,
      }).select("_id status");

      if (dbItems.length !== items.length) {
        return {
          success: false,
          data: { message: "One or more items are invalid or inactive" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      /* ----------------------------
       5. Generate Warehouse ID (safer way)
    ----------------------------- */

      const lastWarehouse = await Warehouse.findOne()
        .sort({ createdAt: -1 })
        .select("warehouseId")
        .lean();

      let nextNumber = 1;

      if (lastWarehouse?.warehouseId) {
        const lastNum = parseInt(lastWarehouse.warehouseId.split("-")[1], 10);
        nextNumber = isNaN(lastNum) ? 1 : lastNum + 1;
      }

      const warehouseId = `SBWAREHOUSE-${String(nextNumber).padStart(3, "0")}`;

      /* ----------------------------
       6. Create Warehouse
    ----------------------------- */
      const warehouse = await Warehouse.create({
        customerId: loggedInUser.customerId,
        customerName: loggedInUser.userName,
        warehouseId,
        warehouseName: warehouseName.trim(),
        warehouseLocation: warehouseLocation?.trim(),
        items: items.map((item) => ({
          itemMasterId: item.itemMasterId,
          warehouseLimit: Number(item.warehouseLimit),
          warehouseReorderLevel: Number(item.warehouseReorderLevel),
          warehouseSafeStock: Number(item.warehouseSafeStock),
        })),
        createdBy: loggedInUser.userName,
      });

      /* ----------------------------
       7. Log Activity
    ----------------------------- */
      await logActivity({
        userId: loggedInUser._id,
        entityType: "Warehouse",
        entityId: warehouse._id,
        actionType: "Created",
        description: `${loggedInUser.userName} created warehouse ${warehouse.warehouseName}`,
      });

      return {
        success: true,
        statusCode: StatusCodes.CREATED,
        data: {
          _id: warehouse._id,
          warehouseId: warehouse.warehouseId,
          warehouseName: warehouse.warehouseName,
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

  async getAll(query, loggedInUser) {
    try {
      const filter = {
        customerId: loggedInUser.customerId,
        status: STATUS.ACTIVE,
      };

      if (query.id) {
        filter._id = query.id;
      }

      const warehouses = await Warehouse.find(filter)
        .sort({ createdAt: -1 })
        .lean();

      await logActivity({
        userId: loggedInUser._id,
        entityType: "Warehouse",
        entityId: warehouses._id,
        actionType: "Read",
        description: `${loggedInUser.userName} read warehouse ${warehouses.warehouseName}`,
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
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          data: { message: "Invalid warehouse ID" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const warehouse = await Warehouse.findOne({
        _id: id,
        customerId: loggedInUser.customerId,
        status: STATUS.ACTIVE,
      });

      if (!warehouse) {
        return {
          success: false,
          data: { message: "Warehouse not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      /* Basic field updates */
      if (data.warehouseName)
        warehouse.warehouseName = data.warehouseName.trim();

      if (data.warehouseLocation)
        warehouse.warehouseLocation = data.warehouseLocation.trim();

      if (data.status !== undefined) warehouse.status = data.status;

      /* Add / Update items */
      if (Array.isArray(data.items)) {
        for (const newItem of data.items) {
          const existingItem = warehouse.items.find(
            (i) => i.itemMasterId.toString() === newItem.itemMasterId,
          );

          if (existingItem) {
            // Update existing item
            existingItem.warehouseLimit = Number(newItem.warehouseLimit);
            existingItem.warehouseReorderLevel = Number(
              newItem.warehouseReorderLevel,
            );
            existingItem.warehouseSafeStock = Number(
              newItem.warehouseSafeStock,
            );
          } else {
            // Add new item
            warehouse.items.push({
              itemMasterId: newItem.itemMasterId,
              warehouseLimit: Number(newItem.warehouseLimit),
              warehouseReorderLevel: Number(newItem.warehouseReorderLevel),
            });
          }
        }
      }

      warehouse.updatedBy = loggedInUser.userName;

      await warehouse.save();

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

  async getCustomerWarehouses(query, loggedInUser) {
    try {
      const filter = {
        customerId: query.id,
        status: STATUS.ACTIVE,
      };

      // Optional single warehouse fetch
      if (query.id) {
        if (!mongoose.Types.ObjectId.isValid(query.id)) {
          return {
            success: false,
            data: { message: "Invalid warehouse ID" },
            statusCode: StatusCodes.BAD_REQUEST,
          };
        }
      }

      const warehouses = await Warehouse.find(filter)
        .sort({ createdAt: -1 })
        .lean();

      if (query.id && warehouses.length === 0) {
        return {
          success: false,
          data: { message: "Warehouse not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

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

  async deleteItem(warehouseId, itemId, loggedInUser) {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(warehouseId) ||
        !mongoose.Types.ObjectId.isValid(itemId)
      ) {
        return {
          success: false,
          data: { message: "Invalid ID" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const warehouse = await Warehouse.findOne({
        _id: warehouseId,
        customerId: loggedInUser.customerId,
        status: STATUS.ACTIVE,
      });

      console.log("warehouse", warehouse.items);

      if (!warehouse) {
        return {
          success: false,
          data: { message: "Warehouse not found" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      const initialLength = warehouse.items.length;

      warehouse.items = warehouse.items.filter(
        (item) => item.itemMasterId.toString() !== itemId,
      );

      console.log(warehouse.items);

      if (warehouse.items.length === initialLength) {
        return {
          success: false,
          data: { message: "Item not found in warehouse" },
          statusCode: StatusCodes.NOT_FOUND,
        };
      }

      await warehouse.save();

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: { message: "Item removed successfully" },
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
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          data: { message: "Invalid warehouse ID" },
          statusCode: StatusCodes.BAD_REQUEST,
        };
      }

      const warehouse = await Warehouse.findOneAndUpdate(
        {
          _id: id,
          customerId: loggedInUser.customerId,
        },
        {
          status: { $in: [STATUS.ACTIVE, STATUS.INACTIVE] },
          updatedBy: loggedInUser.userName,
        },
        { new: true },
      );

      if (!warehouse) {
        return {
          success: false,
          data: { message: "Warehouse not found" },
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
}
