import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Smart Bin API",
      version: "1.0.0",
      description: "API for managing admin and user tasks",
    },
    servers: [
      {
        url: process.env.DEV_API_URL,
        description: "Development server",
      },
      {
        url: process.env.PROD_API_URL,
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        adminAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Authentication for admin endpoints",
        },
        adminRefresh: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Authentication for admin endpoints",
        },
        userAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Common authentication for both admin and vendor endpoints",
        },
        userRefresh: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Authentication for user endpoints",
        },
      },
    },
  },
  apis: [
    "./src/app/CustomerMaster/docs/*.js",
    "./src/app/Project-Master/docs/*.js",
    "./src/app/Item-Master/docs/*.js",
    "./src/app/Warehouse/docs/*.js",
  ],
};

const specs = swaggerJsdoc(options);

// This adds Swagger UI setup with auto Idempotency-Key header
export const swaggerDocs = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      swaggerOptions: {
        persistAuthorization: true,
        requestInterceptor: (req) => {
          // auto-attach Idempotency-Key if missing
          if (!req.headers["Idempotency-Key"]) {
            const newKey = crypto.randomUUID();
            req.headers["Idempotency-Key"] = newKey;
          }
          return req;
        },
      },
    }),
  );

  app.get("/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });
};
