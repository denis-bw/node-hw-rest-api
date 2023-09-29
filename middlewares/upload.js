import multer from "multer";
import path from "path";

const tempDir = path.resolve("temp");

const multerConfig = multer.diskStorage({
    destination: tempDir,
    filename: function (req, file, cb) {
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1E9)}`
    cb(null, `${uniqueSuffix}_${file.originalname}`)
  }
});

const upload = multer({
  storage: multerConfig,
});

export default upload;
// шлях до тимчасової папки