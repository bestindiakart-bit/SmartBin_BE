import { modelRegistry } from "../../utils/modelRegistry.js";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit-table";
import { StatusCodes } from "http-status-codes";
import { STATUS } from "../../constants/status.js";

export class ExportService {
  async generateExport(module, format, filters, loggedInUser) {
    try {
      if (!format) {
        return {
          success: false,
          statusCode: 400,
          data: { message: "Format is required (csv, xls, pdf)" },
        };
      }

      const rawModule = module;

      // convert item_master → itemMaster
      const formattedKey = rawModule.replace(/_([a-z])/g, (_, c) =>
        c.toUpperCase(),
      );

      const Model = modelRegistry[formattedKey];

      if (!Model) {
        return {
          success: false,
          statusCode: 400,
          data: { message: "Invalid module name" },
        };
      }

      const schemaFields = Object.keys(Model.schema.paths);
      const safeFilters = {};

      for (const key in filters) {
        if (schemaFields.includes(key)) {
          safeFilters[key] = filters[key];
        }
      }

      const query = {
        status: STATUS.ACTIVE,
        ...safeFilters,
      };

      const records = await Model.find(query).lean();

      if (!records.length) {
        return {
          success: false,
          statusCode: 404,
          data: { message: "No data found" },
        };
      }

      const cleaned = records.map(({ __v, ...rest }) => rest);

      const fileName = `${module}_${Date.now()}.${format}`;

      // ================= CSV =================
      if (format === "csv") {
        const parser = new Parser();
        const csv = parser.parse(cleaned);

        return {
          success: true,
          statusCode: 200,
          fileBuffer: Buffer.from(csv),
          fileName,
          contentType: "text/csv",
        };
      }

      // ================= EXCEL =================
      if (format === "xlsx") {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Sheet1");

        sheet.columns = Object.keys(cleaned[0]).map((key) => ({
          header: key,
          key,
          width: 20,
        }));

        cleaned.forEach((row) => {
          const formattedRow = {};
          for (let key in row) {
            if (Array.isArray(row[key])) {
              formattedRow[key] = row[key].join(", ");
            } else {
              formattedRow[key] = row[key];
            }
          }
          sheet.addRow(formattedRow);
        });

        const buffer = await workbook.xlsx.writeBuffer();

        return {
          success: true,
          statusCode: 200,
          fileBuffer: buffer,
          fileName,
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        };
      }

      // ================= PDF (UPDATED GRID VERSION) =================
      if (format === "pdf") {
        const doc = new PDFDocument({
          margin: 20,
          size: "A4",
          layout: "landscape",
        });

        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));

        const headers = Object.keys(cleaned[0]);

        const rows = cleaned.map((row) =>
          headers.map((header) => {
            const value = row[header];

            if (Array.isArray(value)) {
              return value.join(", ");
            }

            if (typeof value === "object" && value !== null) {
              return JSON.stringify(value);
            }

            return value !== undefined ? String(value) : "";
          }),
        );

        const table = {
          headers: headers.map((h) => ({
            label: h,
            property: h,
            width: 120, // column width
          })),
          datas: cleaned.map((row) => {
            const formattedRow = {};
            headers.forEach((key) => {
              if (Array.isArray(row[key])) {
                formattedRow[key] = row[key].join(", ");
              } else {
                formattedRow[key] =
                  row[key] !== undefined ? String(row[key]) : "";
              }
            });
            return formattedRow;
          }),
        };

        await doc.table(table, {
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
          prepareRow: () => doc.font("Helvetica").fontSize(7),
        });

        doc.end();

        const pdfBuffer = await new Promise((resolve) => {
          doc.on("end", () => resolve(Buffer.concat(buffers)));
        });

        return {
          success: true,
          statusCode: 200,
          fileBuffer: pdfBuffer,
          fileName,
          contentType: "application/pdf",
        };
      }

      return {
        success: false,
        statusCode: 400,
        data: { message: "Invalid format" },
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
