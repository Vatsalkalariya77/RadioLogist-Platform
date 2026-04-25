const fs = require("fs");
const path = require("path");
const multer = require("multer");

const AppError = require("../utils/appError");

const DICOM_UPLOAD_DIR = path.join("server", "uploads", "dicom");
const MAX_DICOM_FILE_SIZE = 50 * 1024 * 1024;
const MAX_DICOM_FILES = 10;

fs.mkdirSync(DICOM_UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DICOM_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (extension !== ".dcm") {
   return cb(new Error("Only .dcm DICOM files are allowed")); 
  }

  return cb(null, true);
};

const dicomUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_DICOM_FILE_SIZE,
    files: MAX_DICOM_FILES,
  },
});

exports.uploadDicomFiles = (req, res, next) => {
  dicomUpload.array("dicomFiles", MAX_DICOM_FILES)(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return next(new AppError("Each DICOM file must be 50MB or smaller", 400));
      }

      if (error.code === "LIMIT_FILE_COUNT") {
        return next(new AppError(`You can upload a maximum of ${MAX_DICOM_FILES} DICOM files`, 400));
      }

      if (error.code === "LIMIT_UNEXPECTED_FILE") {
        return next(new AppError(`Upload field must be dicomFiles with a maximum of ${MAX_DICOM_FILES} files`, 400));
      }
    }

    return next(error);
  });
};
