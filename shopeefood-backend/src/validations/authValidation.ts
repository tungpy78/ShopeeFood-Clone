import Joi from 'joi';

// 1. Lễ tân Khách hàng & Tài xế (Chỉ cần Phone, Pass, Full name)
export const customerDriverRegisterSchema = Joi.object({
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    password: Joi.string().min(6).required(),
    full_name: Joi.string().required()
});

// 2. Lễ tân Chủ Quán (Tạm thời chỉ cần Phone, Pass) 
// Các thông tin tên quán, địa chỉ sẽ bắt nhập ở API /merchants/create sau khi login
export const merchantRegisterSchema = Joi.object({
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    password: Joi.string().min(6).required()
});

// 3. Đăng nhập chung cho tất cả
export const loginSchema = Joi.object({
    phone: Joi.string().required(),
    password: Joi.string().required()
});