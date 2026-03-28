import { Router } from "express";
import uploadCloud from "../config/cloudinary";
import { uploadImage } from "../controllers/uploadController";

const router = Router();

router.post("/", uploadCloud.single("image"), uploadImage);

export default router;