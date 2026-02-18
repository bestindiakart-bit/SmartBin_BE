import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      let folderPath;

      if (file.fieldname === "itemImage") {
        folderPath = path.join(__dirname, "../../storage/itemImage");
      } else {
        folderPath = path.join(__dirname, "../../storage/admin");
      }

      // Ensure folder exists
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      cb(null, folderPath);
    } catch (error) {
      cb(error);
    }
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",

    // Videos
    "video/mp4",
    "video/mpeg",
    "video/quicktime", // .mov
    "video/x-msvideo", // .avi
    "video/x-matroska", // .mkv
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only image (.jpeg, .jpg, .png) and video (.mp4, .mov, .avi, .mkv) files are allowed",
      ),
      false,
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

export default upload;
