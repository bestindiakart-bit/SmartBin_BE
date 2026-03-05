import express from "express";
import path from "path";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { StatusCodes } from "http-status-codes";
import cors from "cors";
import passport from "passport";
import { Logger } from "../utils/logger.js";
import { corsOptions } from "../config/cors.js";
import { throttle } from "../config/throttle.js";
import { BASE_URL } from "../config/index.js";
import { ErrorConstants } from "../config/error_constants.js";
import { SuccessConstants } from "../config/success_constants.js";
import { swaggerDocs } from "../config/swagger.js";
import { errorHandler } from "../middleware/error.middlware.js";
import { customerMasterRouter } from "./CustomerMaster/routes/customerMaster.route.js";
import userTypeRouter from "./CustomerMaster/routes/userType.route.js";
import userMasterRouter from "./CustomerMaster/routes/userMaster.route.js";
import { projectMasterRouter } from "./Project-Master/routes/projectMaster.route.js";
import { itemCategoryRouter } from "./Item-Master/routes/itemCategory.routes.js";
import { itemMasterRouter } from "./Item-Master/routes/itemMaster.route.js";
import { wareHouseRouter } from "./Warehouse/routes/warehouse.route.js";
import { binMasterRouter } from "./Bin/routes/binConfiguration.route.js";
import { customerTypeRouter } from "./CustomerMaster/routes/customerType.route.js";
import { exportRouter } from "./export/export.route.js";
import binDashboardRouter from "./Bin/routes/binDashboard.route.js";
import orderRouter from "./Warehouse/routes/order.route.js";
import bomRouter from "./Warehouse/routes/bom.route.js";

const { urlencoded, json } = bodyParser;

export function init(app) {
  const __dirname = process.cwd();

  app.use(urlencoded({ extended: true }));
  app.use(json());
  app.use(cookieParser());
  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(passport.initialize());
  app.use(throttle);
  app.use(express.json());

  app.set("trust proxy", 1);

  app.get("/", (req, res) => {
    return res.json({ data: SuccessConstants.HELLO_WORLD });
  });

  app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

  app.use(`${BASE_URL}/customer-master`, customerMasterRouter);
  app.use(`${BASE_URL}/user-type`, userTypeRouter);
  app.use(`${BASE_URL}/user`, userMasterRouter);
  app.use(`${BASE_URL}/project`, projectMasterRouter);
  app.use(`${BASE_URL}/item-category`, itemCategoryRouter);
  app.use(`${BASE_URL}/item-master`, itemMasterRouter);
  app.use(`${BASE_URL}/warehouse`, wareHouseRouter);
  app.use(`${BASE_URL}/bin`, binMasterRouter);
  app.use(`${BASE_URL}/customer-type`, customerTypeRouter);
  app.use(`${BASE_URL}/export`, exportRouter);
  app.use(`${BASE_URL}/bin-dashboard`, binDashboardRouter);
  app.use(`${BASE_URL}/order`,orderRouter );
  app.use(`${BASE_URL}/bom`,bomRouter)


  // Static files
  app.use("/storage", express.static(path.join(__dirname, "storage")));

  // Swagger setup (auto Idempotency-Key handled inside)
  swaggerDocs(app);

  // Fallback route — handles everything else
  app.use((req, res) => {
    if (req.path === `${BASE_URL}/test`) {
      return res.status(StatusCodes.OK).json({
        message:
          "API is working correctly! Latest update on 25/02/2026 at 03:27 PM by Abdur Rahim",
      });
    }

    app.use((req, res) => {
      res
        .status(404)
        .json({ errors: "The resource you are looking for is not found" });
    });

    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ errors: ErrorConstants.RESOURCE_NOT });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);

    Logger.error(err, "EXCEPTION");
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errors:
        err.message ||
        err ||
        String(err) ||
        ErrorConstants.INTERNAL_SERVER_ERROR,
    });
  });

  app.use(errorHandler);
}
