import { Request, Response, NextFunction } from 'express';
import AppResponse from '../utils/AppResponse';
export const uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.file){
            return AppResponse.error(res, 'No file uploaded', 400);
        }
        // 2. Ép kiểu để lấy URL của ảnh từ Cloudinary trả về
        const fileData = req.file as Express.Multer.File & { path: string };

        return AppResponse.success(res, { imageUrl: fileData.path }, 'File uploaded successfully');
    } catch (error) {
        next(error);
    }
}