const multer = require("multer");

const storage = multer.memoryStorage();

// File filter for PDF documents
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed for documents."), false);
  }
};

// File filter for digital signatures (PNG, JPG, WEBP)
const imageFilter = (req, file, cb) => {
  const allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (PNG, JPEG, WEBP) are allowed for signatures."), false);
  }
};

// Upload handler for documents (up to 20MB)
const uploadDocument = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: pdfFilter,
});

// Upload handler for signatures (up to 5MB)
const uploadSignature = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFilter,
});

// General upload (default up to 20MB)
const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

upload.upload = upload;
upload.uploadDocument = uploadDocument;
upload.uploadSignature = uploadSignature;

module.exports = upload;
