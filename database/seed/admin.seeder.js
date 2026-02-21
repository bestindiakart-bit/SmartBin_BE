import mongoose from "mongoose";
import dotenv from "dotenv";
import argon2 from "argon2";
import fs from "fs";
import { Customer } from "../../src/app/CustomerMaster/models/customerMaster.model.js";
import { User } from "../../src/app/CustomerMaster/models/userMaster.model.js";
import { UserType } from "../../src/app/CustomerMaster/models/userType.js";
import { STATUS } from "../../src/constants/status.js";
import { MODULES } from "../../src/constants/modules.js";

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("DB Connected");

    // Read JSON
    const rawData = fs.readFileSync("./database/seed/admin.json");
    const seedData = JSON.parse(rawData);

    const companyName = seedData.customer.companyName.trim();

    /* -------------------------------
       Helper Functions
    -------------------------------- */

    const generateSlug = (name) =>
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, "") // remove special characters
        .replace(/\s+/g, "-");

    const generateUserId = (name) => {
      const cleanName = name.replace(/\s+/g, "");
      const prefix = cleanName.substring(0, 4).padEnd(4, "X").toUpperCase();

      return `${prefix}-USER001`;
    };

    /* -------------------------------
       Create UserType
    -------------------------------- */

    let userType = await UserType.findOne({
      userTypeName: seedData.UserType.userTypeName,
    });

    if (!userType) {
      const fullPermissions = MODULES.map((module) => ({
        module,
        create: true,
        view: true,
        edit: true,
        delete: true,
      }));

      const createdUserType = await UserType.create({
        userTypeName: seedData.UserType.userTypeName,
        permissions: fullPermissions,
        status: STATUS.ACTIVE,
        createdBy: "SEED_SCRIPT",
      });

      userType = createdUserType;
      console.log("UserType created");
    }

    /* -------------------------------
       Create Customer
    -------------------------------- */

    let customer = await Customer.findOne({
      adminEmail: seedData.customer.adminEmail,
    });

    if (!customer) {
      const hashedPassword = await argon2.hash(seedData.customer.adminPassword);

      let generatedUrl = generateSlug(companyName);

      // Duplicate URL protection
      const existingUrl = await Customer.findOne({ url: generatedUrl });

      if (existingUrl) {
        generatedUrl = `${generatedUrl}-${Date.now()}`;
      }

      const createdCustomer = await Customer.create({
        ...seedData.customer,
        adminPassword: hashedPassword,
        url: generatedUrl,
        status: STATUS.ACTIVE,
        createdBy: "SEED_SCRIPT",
      });

      customer = createdCustomer;

      console.log("Customer created");
    }

    /* -------------------------------
       Create Admin User
    -------------------------------- */

    const existingUser = await User.findOne({
      loginEmail: seedData.customer.adminEmail,
    });

    if (!existingUser) {
      const hashedPassword = await argon2.hash(seedData.customer.adminPassword);

      const generatedUserId = generateUserId(companyName);

      await User.create({
        userId: generatedUserId,
        userName: seedData.customer.customerName,
        loginEmail: seedData.customer.adminEmail,
        loginPassword: hashedPassword,
        userTypeId: userType._id,
        customerId: customer._id,
        companyName: customer.companyName,
        url: customer.url, // using same slug as customer
        status: STATUS.ACTIVE,
        permissions: userType.permissions,
        createdBy: "SEED_SCRIPT",
      });

      console.log("Admin user created");
    }

    console.log("Seeding completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seed();
