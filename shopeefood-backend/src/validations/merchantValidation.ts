import Joi from 'joi';

export const createMerchantSchema = Joi.object({
  name: Joi.string().required().messages({ 'any.required': 'Tên quán không được để trống' }),
  address: Joi.string().required(),
  phone: Joi.string().required(),
  // Tọa độ (Latitude/Longitude) bắt buộc phải là số
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  open_time: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).message('Giờ mở cửa phải là định dạng HH:MM (VD: 08:00)'),
  close_time: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).message('Giờ đóng cửa phải là định dạng HH:MM'),
  cover_image: Joi.string().optional(),
  status: Joi.string().valid('PENDING_APPROVAL', 'ACTIVE', 'REJECTED').optional()
});

export const addCategorySchema = Joi.object({
    name: Joi.string().required().messages({'any.required': 'Tên danh mục không được để trống'})
});

export const createFoodSchema = Joi.object({
  category_id: Joi.number().required().messages({ 'any.required': 'Phải chọn danh mục cho món ăn' }),
  name: Joi.string().required().messages({ 'any.required': 'Tên món không được trống' }),
  price: Joi.number().min(0).required().messages({ 
      'number.min': 'Giá tiền không được âm',
      'any.required': 'Phải nhập giá tiền' 
  }),
  description: Joi.string().optional().allow(''),
  image: Joi.string().optional().allow(''), // Tạm thời mình gửi link ảnh dạng text
  is_available: Joi.boolean().optional(),
  option_groups: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
});