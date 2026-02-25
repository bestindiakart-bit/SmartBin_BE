import express from "express";
import { BinDashboardController } from "../controller/binDashboard.controller.js";

const binDashboardRouter = express.Router();

const binDashboardController = new BinDashboardController();

// Create / Update Dashboard
binDashboardRouter.post("/create", binDashboardController.createDashboard);

export default binDashboardRouter;
