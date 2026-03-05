import { Order } from "../../Warehouse/models/order.model.js";
import { Warehouse } from "../../Warehouse/models/warehouse.model.js";
import { WarehouseTransaction } from "../../Warehouse/models/warehousetransation.model.js";
import { BinMaster } from "../models/binConfiguration.model.js";
import { BinLiveStatus } from "../models/binLiveStatus.model.js";
import { BinStatusLog } from "../models/binStatusLog.model.js";

export class BinDashboardService {
  async createDashboard(payload, loggedInUser) {
    try {
      const { masterId, masterStatus, binId, binCurrentQty } = payload;

      // Fetch BinMaster
      const binMaster = await BinMaster.findOne({ binId })
        .populate("itemMasterId", "itemName")
        .lean();

      if (!binMaster) {
        return {
          success: false,
          statusCode: 404,
          data: { message: "Bin not found in BinMaster" },
        };
      }

      const {
        projectName,
        safetyStock,
        reorderLevel,
        maxQuantity,
        warehouseLimit,
        warehouseReorderLevel,
        warehouseSafeStock,
        itemMasterId,
      } = binMaster;

      const itemName = itemMasterId?.itemName || "";

      // ================= BIN STATUS =================
      let binStatus;

      if (binCurrentQty >= safetyStock) {
        binStatus = "GREEN";
      } else if (binCurrentQty < safetyStock && binCurrentQty >= reorderLevel) {
        binStatus = "YELLOW";
      } else if (binCurrentQty > 0) {
        binStatus = "RED";
      } else {
        binStatus = "DANGER";
      }

      // ================= WAREHOUSE STATUS =================
      let whStatus;

      if (binCurrentQty >= warehouseSafeStock) {
        whStatus = "GREEN";
      } else if (
        binCurrentQty < warehouseSafeStock &&
        binCurrentQty >= warehouseReorderLevel
      ) {
        whStatus = "YELLOW";
      } else if (binCurrentQty > 0) {
        whStatus = "RED";
      } else {
        whStatus = "DANGER";
      }

      // ================= UPSERT =================
      const dashboard = await BinMainDashboard.findOneAndUpdate(
        {
          customerId: loggedInUser.customerId,
          masterId,
          binId,
        },
        {
          customerId: loggedInUser.customerId,
          projectName,
          masterId,
          binId,
          itemName,
          binStatus,
          binCurrentQty,
          binSafetyLimit: safetyStock,
          binReorderLevel: reorderLevel,
          binMaxLimit: maxQuantity,
          binStatusUpdatedOn: new Date(),
          whStatus,
          whSafetyLimit: warehouseSafeStock,
          whReorderLevel: warehouseReorderLevel,
          whMaxLimit: warehouseLimit,
          whStatusUpdatedOn: new Date(),
          currentStatus: masterStatus,
        },
        { upsert: true, new: true },
      );

      return {
        success: true,
        statusCode: 201,
        data: dashboard,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        data: { message: error.message },
      };
    }
  }

  async getDashboard(loggedInUser) {
    try {
      const filter = {};

      if (!loggedInUser.owner) {
        filter.customerId = loggedInUser.customerId;
      }

      const bins = await BinMaster.find(filter)
        .populate("customerId", "customerName")
        .populate("projectId", "projectName")
        .populate("itemMasterId", "itemName")
        .populate({
          path: "warehouseId",
          select: "warehouseName items",
        })
        .select("-__v")
        .lean();

      if (!bins.length) {
        return {
          success: true,
          statusCode: 200,
          data: { records: [] },
        };
      }

      const dashboardData = bins.map((bin) => {
        let warehouseCurrentStock = null;
        let warehouseSafetyLimit = null;
        let warehouseReorderLevel = null;
        let warehouseMaxLimit = null;
        let warehouseLastUpdatedDate = null;

        let warehouseStatusTag = null;
        let warehouseStatusMessage = null;

        if (bin.warehouseId && bin.warehouseId.items) {
          const warehouseItem = bin.warehouseId.items.find(
            (item) =>
              String(item.itemMasterId) === String(bin.itemMasterId._id),
          );

          if (warehouseItem) {
            warehouseCurrentStock = warehouseItem.currentStock;
            warehouseSafetyLimit = warehouseItem.warehouseSafeStock;
            warehouseReorderLevel = warehouseItem.warehouseReorderLevel;
            warehouseMaxLimit = warehouseItem.warehouseLimit;
            warehouseLastUpdatedDate = warehouseItem.lastTransactionDate;

            if (
              warehouseCurrentStock !== null &&
              warehouseSafetyLimit !== null &&
              warehouseReorderLevel !== null
            ) {
              // 🔴 DANGER - Zero Stock
              if (warehouseCurrentStock === 0) {
                warehouseStatusTag = "danger";
                warehouseStatusMessage =
                  "Warehouse Empty - Immediate Refill Required";
              }

              // 🔴 RED - Below or Equal Reorder Level
              else if (warehouseCurrentStock <= warehouseReorderLevel) {
                warehouseStatusTag = "red";
                warehouseStatusMessage =
                  "Warehouse Stock Critical - Reorder Required";
              }

              // 🟡 YELLOW - Between Reorder & Safety
              else if (warehouseCurrentStock <= warehouseSafetyLimit) {
                warehouseStatusTag = "yellow";
                warehouseStatusMessage = "Warehouse Stock Below Safety Level";
              }

              // 🟢 GREEN - Healthy
              else if (warehouseCurrentStock > warehouseSafetyLimit) {
                warehouseStatusTag = "green";
                warehouseStatusMessage = "Warehouse Stock Healthy";
              }
            }
          }
        }

        return {
          customerName: bin.customerId?.customerName || null,
          customerMasterId: bin.customerId._id,
          projectName: bin.projectId?.projectName || null,

          masterId: bin.masterId,
          binId: bin.binId,
          itemName: bin.itemMasterId?.itemName || bin.customerItemName,
          itemMasterID: bin.itemMasterId._id,

          // BIN LEVEL
          binSafetyLimit: bin.safetyStockQuantity,
          binReorderLevel: bin.rol,
          binMaxLimit: bin.binAllowablelimit,

          // WAREHOUSE LEVEL
          warehouseCurrentStock,
          warehouseSafetyLimit,
          warehouseReorderLevel,
          warehouseMaxLimit,
          warehouseLastUpdatedDate,
          warehouseStatusTag,
          warehouseStatusMessage,

          status: bin.status,
        };
      });

      return {
        success: true,
        statusCode: 200,
        data: {
          records: dashboardData,
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

  async processPayload(payload) {
    console.log(payload);

    try {
      if (!payload?.data || !Array.isArray(payload.data)) {
        return this.badRequest("Invalid payload format");
      }

      const responseData = [];

      for (const master of payload.data) {
        for (const bin of master.bins) {
          const result = await this.processSingleBin(
            master.masterID,
            master.masterStatus,
            bin,
          );
          responseData.push(result);
        }
      }

      return {
        success: true,
        statusCode: 200,
        data: responseData,
      };
    } catch (error) {
      return this.serverError(error.message);
    }
  }

  async processSingleBin(masterId, masterStatus, bin) {
    const binConfig = await BinMaster.findOne({
      masterId,
      binId: bin.binId,
      status: 1,
    }).lean();

    if (!binConfig) {
      return {
        masterId,
        binId: bin.binId,
        statusTag: "danger",
        message: "Bin configuration not found",
      };
    }

    const stock = bin.piecesRemaining ?? 0;

    let statusTag = "green";
    let statusMessage = "Normal Stock";

    // 🔴 1️⃣ Excess Stock (Only Customer Allowable Limit)
    if (
      binConfig.customerAllowableLimit &&
      stock > binConfig.customerAllowableLimit
    ) {
      statusTag = "red";
      statusMessage = "Excess Stock - Above Customer Allowable Limit";
    }

    // 🔵 2️⃣ Above Reorder Level
    else if (stock > binConfig.rol) {
      statusTag = "blue";
      statusMessage = "Overstock - Above Reorder Level";
    }

    // 🟢 3️⃣ Normal Range
    else if (stock <= binConfig.rol && stock > binConfig.safetyStockQuantity) {
      statusTag = "green";
      statusMessage = "Normal Stock Level";
    }

    // 🟡 4️⃣ Below Safety
    else if (stock <= binConfig.safetyStockQuantity && stock > 0) {
      statusTag = "yellow";
      statusMessage = "Reorder Alert - Below Safety Stock";
    }

    // 🟠 5️⃣ Critical (Below Half Safety)
    if (stock > 0 && stock <= binConfig.safetyStockQuantity / 2) {
      statusTag = "orange";
      statusMessage = "Critical Level - Immediate Replenishment Required";
    }

    // 🚨 6️⃣ Zero Stock (Highest Priority)
    if (stock === 0) {
      statusTag = "danger";
      statusMessage = "Zero Stock - Machine Stop";
    }

    // 🔹 Get previous live data
    const previousLive = await BinLiveStatus.findOne({
      masterId,
      binId: bin.binId,
    }).lean();

    const previousQuantity = previousLive?.currentQuantity ?? null;
    const previousWeight = previousLive?.currentWeight ?? null;
    const previousStatus = previousLive?.statusTag ?? null;
    const previousMasterStatus = previousLive?.masterStatus ?? null;
    const previousBinStatus = previousLive?.binStatus ?? null;

    const currentQuantity = stock;
    const currentWeight = bin.weight ?? 0;
    const currentStatus = statusTag;

    const differenceQuantity =
      previousQuantity !== null
        ? currentQuantity - previousQuantity
        : currentQuantity;

    /* ================= WAREHOUSE REDUCE LOGIC ================= */

    /* ================= WAREHOUSE REDUCE + TRANSACTION ================= */

    let warehouseCurrentStock = previousLive?.warehouseCurrentStock ?? null;

    if (bin.isReloaded === true && bin.reloadaedquantity > 0) {
      const warehouse = await Warehouse.findOne({
        _id: binConfig.warehouseId,
        status: 1,
      });

      if (warehouse) {
        const item = warehouse.items.find(
          (i) =>
            i.itemMasterId.toString() === binConfig.itemMasterId.toString(),
        );

        if (item) {
          const previousStock = item.currentStock;

          // 🔻 Reduce stock
          item.currentStock -= bin.reloadaedquantity;

          // Prevent negative stock
          if (item.currentStock < 0) {
            item.currentStock = 0;
          }

          const newStock = item.currentStock;

          warehouseCurrentStock = newStock;

          await warehouse.save();

          /* ================= AUTO ORDER TRIGGER ================= */

          if (item.currentStock <= item.warehouseReorderLevel) {
            // Check if order already exists for this item and warehouse
            const existingOrder = await Order.findOne({
              customerId: warehouse.customerId,
              status: { $in: [1, 2] }, // PLACED or APPROVED
              "items.itemId": binConfig.itemMasterId,
            });

            if (!existingOrder) {
              // Calculate Order Quantity
              const orderQuantity = item.warehouseLimit - item.currentStock;

              if (orderQuantity > 0) {
                const orderNumber = `SBORDER-${Date.now()}`;

                await Order.create({
                  orderId: orderNumber,
                  customerId: warehouse.customerId,
                  orderDate: new Date(),
                  status: 1, // PLACED
                  paymentStatus: 1, // PENDING
                  shippingAddress: "AUTO GENERATED",
                  items: [
                    {
                      itemId: binConfig.itemMasterId,
                      quantity: orderQuantity,
                    },
                  ],
                  orderLogs: [
                    {
                      status: 1,
                      changedBy: null,
                      role: "SYSTEM",
                      remarks: `Auto order triggered. Stock reached ROL (${item.warehouseReorderLevel})`,
                    },
                  ],
                  createdBy: "SYSTEM_AUTO_IOT",
                });
              }
            }
          }

          /* ================= CREATE TRANSACTION ENTRY ================= */

          await WarehouseTransaction.create({
            warehouseId: warehouse._id,
            itemMasterId: binConfig.itemMasterId,
            transactionType: "RELOAD_TO_BIN",
            quantity: bin.reloadaedquantity,
            previousStock: previousStock,
            newStock: newStock,
            referenceId: bin.binId,
            transactionDate: new Date(bin.time),
            createdBy: "IOT Machine",
          });
        }
      }
    }

    // 🔹 Save Log if ANYTHING changed
    if (
      previousQuantity !== currentQuantity ||
      previousWeight !== currentWeight ||
      previousStatus !== currentStatus ||
      previousMasterStatus !== masterStatus ||
      previousBinStatus !== bin.binStatus
    ) {
      await BinStatusLog.create({
        masterId,
        masterStatus: masterStatus || null,
        binStatus: bin.binStatus || null,
        binId: bin.binId,
        previousQuantity,
        currentQuantity,
        differenceQuantity,
        previousWeight,
        currentWeight,
        previousStatus,
        currentStatus,
        statusMessage,
        loggedAt: new Date(bin.time),
      });
    }

    // 🔹 Update Live Status
    await BinLiveStatus.findOneAndUpdate(
      { masterId, binId: bin.binId },
      {
        masterId,
        binId: bin.binId,
        masterStatus: masterStatus || null,
        binStatus: bin.binStatus || null,
        currentQuantity,
        currentWeight,
        currentStatus,
        statusTag,
        statusMessage,
        warehouseCurrentStock: previousLive?.warehouseCurrentStock ?? null,
        lastUpdatedAt: new Date(bin.time),
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

    return {
      masterId,
      binId: bin.binId,
      masterStatus,
      binStatus: bin.binStatus,
      piecesRemaining: currentQuantity,
      weight: currentWeight,
      statusTag,
      statusMessage,
    };
  }
  badRequest(message) {
    return {
      success: false,
      statusCode: 400,
      data: { message },
    };
  }

  serverError(message) {
    return {
      success: false,
      statusCode: 500,
      data: { message },
    };
  }

  async getAllLiveStatus(query) {
    try {
      const { masterId, binId, statusTag } = query;

      const filter = {};

      if (masterId) filter.masterId = masterId;
      if (binId) filter.binId = binId;
      if (statusTag) filter.statusTag = statusTag;

      const data = await BinLiveStatus.find(filter)
        .sort({ lastUpdatedAt: -1 })
        .lean();

      return {
        success: true,
        statusCode: 200,
        count: data.length,
        data,
      };
    } catch (error) {
      return this.serverError(error.message);
    }
  }
}

export default BinDashboardService;
