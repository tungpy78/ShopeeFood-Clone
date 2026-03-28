import Joi from 'joi';

// 1. Luật cho Đăng ký
export const registerSchema = Joi.object({
  phone: Joi.string().min(10).max(11).pattern(/^[0-9]+$/).required().messages({
    'string.empty': 'Số điện thoại không được để trống',
    'string.min': 'Số điện thoại phải có ít nhất 10 số',
    'string.pattern.base': 'Số điện thoại chỉ được chứa số'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'any.required': 'Mật khẩu là bắt buộc'
  }),
  full_name: Joi.string().min(2).optional(),
  role_id: Joi.number().integer().valid(2, 3, 4).optional().messages({
    'any.only': 'Vai trò không hợp lệ (2: Khách, 3: Tài xế, 4: Quán)'
  })
});

// 2. Luật cho Đăng nhập
export const loginSchema = Joi.object({
  phone: Joi.string().required().messages({
    'any.required': 'Vui lòng nhập số điện thoại'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Vui lòng nhập mật khẩu'
  })
});