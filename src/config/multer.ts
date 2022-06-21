const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    cb(null, "./uploads/");
  },
  filename: (req: any, file: any, cb: any) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb({ message: "Only jpeg and png files are allowed" }, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 },
  fileFilter: fileFilter,
});

module.exports = upload;
