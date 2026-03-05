import { StatusCodes } from "http-status-codes";
import { STATUS } from "../../../constants/status.js";
import mongoose from "mongoose";
import { Project } from "../../Project-Master/models/projectMaster.model.js";
import { BinMaster } from "../models/binConfiguration.model.js";
import { ItemMaster } from "../../Item-Master/models/itemMaster.model.js";
import { Warehouse } from "../../Warehouse/models/warehouse.model.js";

export class BinMasterService {
  async create(data, loggedInUser) {
    try {
      const {
        customerId,
        projectId,
        masterId,
        binId,
        binAllowablelimit,
        binAllowableWeight, // ex: "2 kg"
        customerAllowableLimit,
        customerAllowableWeight, // ex: "1 kg"
        safetyStockQuantity,
        rol,
        itemPerPrice,
        weightPerPiece,
        itemMasterId,
        warehouseId,
      } = data;

      /* =====================================
       ✅ AUTH CHECK
    ===================================== */
      if (!loggedInUser || !loggedInUser._id) {
        return {
          success: false,
          statusCode: StatusCodes.UNAUTHORIZED,
          data: { message: "Unauthorized user" },
        };
      }

      const isOwner = loggedInUser.owner === true;
      let finalCustomerId;

      if (isOwner) {
        if (!customerId) {
          return {
            success: false,
            statusCode: StatusCodes.BAD_REQUEST,
            data: { message: "customerId is required" },
          };
        }
        finalCustomerId = customerId;
      } else {
        const loginCustomerId = loggedInUser.customerId?._id;
        if (!loginCustomerId) {
          return {
            success: false,
            statusCode: StatusCodes.UNAUTHORIZED,
            data: { message: "User not mapped to any company" },
          };
        }
        finalCustomerId = loginCustomerId.toString();
      }

      /* =====================================
       ✅ REQUIRED FIELD CHECK
    ===================================== */
      if (
        !finalCustomerId ||
        !projectId ||
        !masterId ||
        !binId ||
        !itemMasterId ||
        !warehouseId ||
        !binAllowableWeight ||
        !customerAllowableWeight ||
        binAllowablelimit == null ||
        customerAllowableLimit == null
      ) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: { message: "Required fields missing" },
        };
      }

      /* =====================================
       ✅ VALIDATE IDS
    ===================================== */
      if (
        !mongoose.Types.ObjectId.isValid(finalCustomerId) ||
        !mongoose.Types.ObjectId.isValid(projectId) ||
        !mongoose.Types.ObjectId.isValid(itemMasterId) ||
        !mongoose.Types.ObjectId.isValid(warehouseId)
      ) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: { message: "Invalid ID format" },
        };
      }

      /* =====================================
       ✅ CHECK PROJECT
    ===================================== */
      const project = await Project.findOne({
        _id: projectId,
        customerId: finalCustomerId,
        status: STATUS.ACTIVE,
      }).lean();

      if (!project) {
        return {
          success: false,
          statusCode: StatusCodes.NOT_FOUND,
          data: { message: "Project not found" },
        };
      }

      /* =====================================
       ✅ CHECK ITEM MASTER
    ===================================== */
      const item = await ItemMaster.findOne({
        _id: itemMasterId,
        status: STATUS.ACTIVE,
      }).lean();

      if (!item || !item.weightPerUnit) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: { message: "Invalid item or weightPerUnit missing" },
        };
      }

      const weightPerUnit = Number(item.weightPerUnit);

      /* =====================================
       ✅ CHECK WAREHOUSE
    ===================================== */
      const warehouse = await Warehouse.findOne({
        _id: warehouseId,
        customerId: finalCustomerId,
        status: STATUS.ACTIVE,
      }).lean();

      if (!warehouse) {
        return {
          success: false,
          statusCode: StatusCodes.NOT_FOUND,
          data: { message: "Warehouse not found" },
        };
      }

      const warehouseItem = warehouse.items.find(
        (i) => i.itemMasterId.toString() === itemMasterId,
      );

      if (!warehouseItem) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: { message: "Item not available in selected warehouse" },
        };
      }

      /* =====================================
       🔥 PARSE BIN WEIGHT
    ===================================== */
      const parseWeight = (weightString, label) => {
        const parts = weightString.trim().split(" ");
        if (parts.length !== 2) {
          throw new Error(`${label} must be like '2 kg' or '100 g'`);
        }

        const value = Number(parts[0]);
        const unit = parts[1].toLowerCase();

        if (isNaN(value) || value <= 0) {
          throw new Error(`Invalid ${label} value`);
        }

        if (unit === "kg") return value * 1000;
        if (unit === "g") return value;

        throw new Error(`${label} unit must be kg or g`);
      };

      let weightInGrams;
      let customerWeightInGrams;

      try {
        weightInGrams = parseWeight(binAllowableWeight, "Bin weight");
        customerWeightInGrams = parseWeight(
          customerAllowableWeight,
          "Customer allowable weight",
        );
      } catch (err) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: { message: err.message },
        };
      }

      /* =====================================
       🔥 CALCULATIONS
    ===================================== */

      const calculatedBinLimit = Math.floor(weightInGrams / weightPerUnit);

      if (calculatedBinLimit <= 0) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: { message: "Bin weight too small for this item" },
        };
      }

      const calculatedCustomerLimit = Math.floor(
        customerWeightInGrams / weightPerUnit,
      );

      if (calculatedCustomerLimit <= 0) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: { message: "Customer weight too small for this item" },
        };
      }

      /* =====================================
       🔥 STRICT VALIDATION
    ===================================== */

      if (Number(binAllowablelimit) !== calculatedBinLimit) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: {
            message: `Bin allowable limit mismatch. Expected ${calculatedBinLimit}, but received ${binAllowablelimit}`,
          },
        };
      }

      if (Number(customerAllowableLimit) !== calculatedCustomerLimit) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: {
            message: `Customer allowable limit mismatch. Expected ${calculatedCustomerLimit}, but received ${customerAllowableLimit}`,
          },
        };
      }

      if (customerWeightInGrams > weightInGrams) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: {
            message:
              "Customer allowable weight cannot exceed bin allowable weight",
          },
        };
      }

      /* =====================================
       ✅ CREATE BIN
    ===================================== */
      const bin = await BinMaster.create({
        customerId: finalCustomerId,
        projectId,
        masterId,
        binId,
        itemMasterId,
        customerItemName: item.itemName,
        binAllowablelimit: calculatedBinLimit,
        binAllowableWeight: weightInGrams,
        customerAllowableLimit: calculatedCustomerLimit,
        customerAllowableWeight: customerWeightInGrams,
        safetyStockQuantity,
        rol,
        itemPerPrice,
        weightPerPiece: weightPerPiece,
        warehouseId,
        createdBy: loggedInUser.userName,
      });

      return {
        success: true,
        statusCode: StatusCodes.CREATED,
        data: {
          id: bin._id,
          binId: bin.binId,
          binAllowablelimit: calculatedBinLimit,
          binAllowableWeightInGrams: weightInGrams,
          customerAllowableLimit: calculatedCustomerLimit,
          customerAllowableWeightInGrams: customerWeightInGrams,
        },
      };
    } catch (err) {
      if (err.code === 11000) {
        return {
          success: false,
          statusCode: StatusCodes.CONFLICT,
          data: { message: "Bin already exists for this project" },
        };
      }

      return {
        success: false,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        data: { message: err.message },
      };
    }
  }

  async getAll(query, loggedInUser) {
    try {
      let {
        page = 1,
        limit = 10,
        customerId,
        projectId,
        itemMasterId,
        search,
        status,
      } = query;

      page = parseInt(page);
      limit = parseInt(limit);

      if (isNaN(page) || page < 1) page = 1;
      if (isNaN(limit) || limit < 1) limit = 10;
      if (limit > 100) limit = 100;

      const skip = (page - 1) * limit;

      // =====================================
      // 🔹 FILTER BUILDING
      // =====================================
      const filter = {};

      // -------------------------------------
      // Customer Filter
      // -------------------------------------
      if (loggedInUser.owner) {
        // Owner user can see all customers
        if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
          filter.customerId = customerId;
        }
      } else {
        // Normal user can only see their own customerId
        filter.customerId = loggedInUser.customerId;

        // Optional: if frontend passed a customerId that's not theirs, ignore
        if (customerId && customerId !== String(loggedInUser.customerId)) {
          return {
            success: false,
            statusCode: 403,
            data: { message: "You can only access your own customer data" },
          };
        }
      }

      // -------------------------------------
      // Status Filter (default ACTIVE)
      // -------------------------------------
      // Status Filter (Hide only DELETED)
      if (status !== undefined) {
        filter.status = Number(status);
      } else {
        filter.status = { $ne: STATUS.DELETED };
      }

      // -------------------------------------
      // Optional Filters
      // -------------------------------------
      if (projectId) filter.projectId = projectId;
      if (itemMasterId) filter.itemMasterId = itemMasterId;

      // -------------------------------------
      // Search Filter
      // -------------------------------------
      if (search) {
        filter.$or = [
          { binId: { $regex: search, $options: "i" } },
          { masterId: { $regex: search, $options: "i" } },
          { customerItemName: { $regex: search, $options: "i" } },
          { supplierItemName: { $regex: search, $options: "i" } },
        ];
      }

      // =====================================
      // 🔹 QUERY
      // =====================================
      const [recordsRaw, total] = await Promise.all([
        BinMaster.find(filter)
          .populate("customerId", "customerName") // populate customer
          .populate("projectId", "projectName") // populate project
          .populate("itemMasterId", "itemName weightPerUnit") // populate item
          .select("-__v")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        BinMaster.countDocuments(filter),
      ]);

      // Format weight like "2 kg"
      const records = recordsRaw.map((bin) => ({
        ...bin,
        binMaxWeightFormatted: bin.binMaxWeight
          ? `${bin.binMaxWeight} ${bin.weightUnit || "kg"}`
          : null,
      }));

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          records,
        },
      };
    } catch (error) {
      return {
        success: false,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        data: { message: error.message },
      };
    }
  }

  async getById(id, loggedInUser) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          statusCode: 400,
          data: { message: "Invalid ID" },
        };
      }

      const bin = await BinMaster.findOne({ _id: id })
        .populate("customerId", "customerName")
        .populate("projectId", "projectName")
        .populate("itemMasterId", "itemName")
        .select("-__v")
        .lean();

      if (!bin) {
        return {
          success: false,
          statusCode: 404,
          data: { message: "Bin not found" },
        };
      }

      // Ownership check: non-owner can only access their own bins
      if (
        !loggedInUser.owner &&
        String(bin.customerId._id) !== String(loggedInUser.customerId)
      ) {
        return {
          success: false,
          statusCode: 403,
          data: { message: "You can only access your own bin data" },
        };
      }

      return {
        success: true,
        statusCode: 200,
        data: {
          record: {
            ...bin,
            binMaxWeightFormatted: bin.binMaxWeight
              ? `${bin.binMaxWeight} ${bin.weightUnit || "kg"}`
              : null,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        data: { message: error.message },
      };
    }
  }

  async update(id, data, loggedInUser) {
    console.log(id);

    try {
      if (!loggedInUser || !loggedInUser._id) {
        return {
          success: false,
          statusCode: StatusCodes.UNAUTHORIZED,
          data: { message: "Unauthorized user" },
        };
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: { message: "Invalid Bin ID" },
        };
      }

      const {
        customerId,
        projectId,
        masterId,
        binId,
        binAllowableWeight,
        binAllowablelimit,
        customerAllowableWeight,
        customerAllowableLimit,
        safetyStockQuantity,
        rol,
        itemPerPrice,
        weightPerPiece,
        itemMasterId,
        warehouseId,
        status,
      } = data;

      const isOwner = loggedInUser.owner === true;

      let finalCustomerId = customerId;

      if (!isOwner) {
        const loginCustomerId = loggedInUser.customerId?._id;
        console.log(loginCustomerId);

        if (!loginCustomerId) {
          return {
            success: false,
            statusCode: StatusCodes.UNAUTHORIZED,
            data: { message: "User not mapped to any company" },
          };
        }

        finalCustomerId = loginCustomerId.toString();
      }

      const existingBin = await BinMaster.findOne({
        _id: id,
        customerId: finalCustomerId,
      });
      console.log(existingBin);

      if (!existingBin) {
        return {
          success: false,
          statusCode: StatusCodes.NOT_FOUND,
          data: { message: "Bin not found" },
        };
      }

      const updateData = { updatedBy: loggedInUser.userName };

      const finalItemId = itemMasterId || existingBin.itemMasterId;

      const item = await ItemMaster.findOne({
        _id: finalItemId,
        status: STATUS.ACTIVE,
      }).lean();

      if (!item || !item.weightPerUnit) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: { message: "Invalid item or weightPerUnit missing" },
        };
      }

      const weightPerUnit = Number(item.weightPerUnit);

      // ---------------------------------------
      // 🔥 WEIGHT PARSER FUNCTION
      // ---------------------------------------
      const parseWeight = (weightString, label) => {
        const parts = weightString.trim().split(" ");
        if (parts.length !== 2)
          throw new Error(`${label} must be like '2 kg' or '100 g'`);

        const value = Number(parts[0]);
        const unit = parts[1].toLowerCase();

        if (isNaN(value) || value <= 0)
          throw new Error(`Invalid ${label} value`);

        if (unit === "kg") return value * 1000;
        if (unit === "g") return value;

        throw new Error(`${label} unit must be kg or g`);
      };

      let finalBinWeight = existingBin.binAllowableWeight; // fallback to old
      let finalCustomerWeight = existingBin.customerAllowableWeight;

      try {
        if (binAllowableWeight !== undefined) {
          finalBinWeight = parseWeight(binAllowableWeight, "Bin weight");
        }

        if (customerAllowableWeight !== undefined) {
          finalCustomerWeight = parseWeight(
            customerAllowableWeight,
            "Customer allowable weight",
          );
        }
      } catch (err) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: { message: err.message },
        };
      }

      // ---------------------------------------
      // 🔥 CALCULATIONS
      // ---------------------------------------
      const calculatedBinLimit = Math.floor(finalBinWeight / weightPerUnit);

      if (calculatedBinLimit <= 0) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: { message: "Bin weight too small for this item" },
        };
      }

      const calculatedCustomerLimit = Math.floor(
        finalCustomerWeight / weightPerUnit,
      );

      if (calculatedCustomerLimit <= 0) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: { message: "Customer weight too small for this item" },
        };
      }

      // ---------------------------------------
      // 🔥 STRICT MISMATCH VALIDATION
      // ---------------------------------------

      if (
        binAllowablelimit !== undefined &&
        Number(binAllowablelimit) !== calculatedBinLimit
      ) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: {
            message: `Bin allowable limit mismatch. Expected ${calculatedBinLimit}, but received ${binAllowablelimit}`,
          },
        };
      }

      if (
        customerAllowableLimit !== undefined &&
        Number(customerAllowableLimit) !== calculatedCustomerLimit
      ) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: {
            message: `Customer allowable limit mismatch. Expected ${calculatedCustomerLimit}, but received ${customerAllowableLimit}`,
          },
        };
      }

      if (finalCustomerWeight > finalBinWeight) {
        return {
          success: false,
          statusCode: StatusCodes.BAD_REQUEST,
          data: {
            message:
              "Customer allowable weight cannot exceed bin allowable weight",
          },
        };
      }

      // ---------------------------------------
      // ✅ SET UPDATED VALUES
      // ---------------------------------------

      updateData.binAllowableWeight = finalBinWeight;
      updateData.binAllowablelimit = calculatedBinLimit;
      updateData.customerAllowableWeight = finalCustomerWeight;
      updateData.customerAllowableLimit = calculatedCustomerLimit;

      if (masterId !== undefined) updateData.masterId = masterId;
      if (binId !== undefined) updateData.binId = binId;
      if (safetyStockQuantity !== undefined)
        updateData.safetyStockQuantity = safetyStockQuantity;
      if (rol !== undefined) updateData.rol = rol;
      if (itemPerPrice !== undefined) updateData.itemPerPrice = itemPerPrice;
      if (weightPerPiece !== undefined)
        updateData.weightPerPiece = weightPerPiece;
      if (status !== undefined) updateData.status = Number(status);

      const updated = await BinMaster.findOneAndUpdate(
        { _id: id, customerId: finalCustomerId },
        { $set: updateData },
        { returnDocument: "after", runValidators: true },
      ).lean();

      return {
        success: true,
        statusCode: StatusCodes.OK,
        data: updated,
      };
    } catch (err) {
      if (err.code === 11000) {
        return {
          success: false,
          statusCode: StatusCodes.CONFLICT,
          data: { message: "Bin already exists for this project" },
        };
      }

      return {
        success: false,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        data: { message: err.message },
      };
    }
  }

  async getItemsByCustomerAndProject(query, loggedInUser) {    
    try {
      if (!loggedInUser) {
        return {
          success: false,
          statusCode: 401,
          data: { message: "Invalid token data" },
        };
      }

      const { customerId, projectId } = query;

      if (!customerId || !projectId) {
        return {
          success: false,
          statusCode: 400,
          data: { message: "customerId and projectId are required" },
        };
      }

      const bins = await BinMaster.find({
        customerId,
        projectId,
        status: STATUS.ACTIVE,
      })
        .populate("itemMasterId", "itemName itemCode")
        .lean();

      if (!bins.length) {
        return {
          success: true,
          statusCode: 200,
          data: [],
        };
      }

      // Remove duplicates (if multiple bins contain same item)
      const itemMap = new Map();

      bins.forEach((bin) => {
        if (bin.itemMasterId?._id) {
          const id = bin.itemMasterId._id.toString();

          if (!itemMap.has(id)) {
            itemMap.set(id, {
              _id: bin.itemMasterId._id,
              itemName: bin.itemMasterId.itemName,
              itemCode: bin.itemMasterId.itemCode,
              customerItemName: bin.customerItemName,
              binId: bin.binId,
            });
          }
        }
      });

      return {
        success: true,
        statusCode: 200,
        data: Array.from(itemMap.values()),
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        data: { message: error.message },
      };
    }
  }
}
