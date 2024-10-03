import multer from "multer";

const storage = multer.memoryStorage();
const limits = { fileSize: 10 * 1024 * 1024 }; // 10MB

const singleUpload = multer({ storage, limits }).single("file");
const multiUpload = multer({ storage, limits }).fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "2dModel", maxCount: 1 },
]);

export { singleUpload, multiUpload };
