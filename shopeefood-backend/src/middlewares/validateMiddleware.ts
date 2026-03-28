import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import AppResponse from '../utils/AppResponse';

/**
 * Hàm này trả về một Middleware function
 * @param schema Bộ luật cần kiểm tra (VD: loginSchema)
 */
const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Thực hiện validate
    const { error } = schema.validate(req.body, { 
      abortEarly: false // Kiểm tra hết lỗi chứ không dừng ở lỗi đầu tiên
    });

    if (error) {
      // Nếu có lỗi, lấy ra message chi tiết
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      
      // Trả về lỗi 400 (Bad Request) ngay lập tức
      return AppResponse.error(res, errorMessage, 400);
    }

    // Nếu không lỗi, cho qua
    next();
  };
};

export default validate;