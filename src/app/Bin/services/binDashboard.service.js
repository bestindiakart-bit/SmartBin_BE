import { BinMaster } from "../models/binConfiguration.model.js";
import BinMainDashboard from "../models/binDashBoardSchema.model.js";

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
}

export default BinDashboardService;
