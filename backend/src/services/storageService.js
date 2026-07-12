import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Uploads a single file to local storage.
 * Easily swappable for S3 uploads later.
 * @param {Express.Multer.File} file 
 * @returns {Promise<string>} relative URL path of the uploaded file
 */
export const uploadToStorage = async (file) => {
  if (!file) return null;
  const uploadDir = "./uploads";
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const fileKey = `${crypto.randomBytes(16).toString("hex")}${path.extname(file.originalname || "")}`;
  const destPath = path.join(uploadDir, fileKey);
  
  await fs.promises.writeFile(destPath, file.buffer);
  return `/uploads/${fileKey}`;
};

/**
 * Uploads multiple files to local storage.
 * @param {Express.Multer.File[]} files 
 * @returns {Promise<string[]>} array of relative URL paths of uploaded files
 */
export const uploadMultipleToStorage = async (files) => {
  if (!files || files.length === 0) return [];
  const promises = files.map((file) => uploadToStorage(file));
  return Promise.all(promises);
};
