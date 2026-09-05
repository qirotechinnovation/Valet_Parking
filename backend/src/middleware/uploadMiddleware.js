const multer = require("multer");

const storage = multer.memoryStorage();

const uploadInspectionPhoto = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG and WebP images are allowed."));
    }

    cb(null, true);
  }
});

module.exports = uploadInspectionPhoto;