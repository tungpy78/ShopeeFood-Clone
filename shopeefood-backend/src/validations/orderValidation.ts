import Joi from 'joi';

export const createOrderSchema = Joi.object({
  merchant_id: Joi.number().required().messages({
    'any.required': 'Phải chọn quán ăn'
  }),
  shipping_address: Joi.string().required().messages({
    'any.required': 'Phải nhập địa chỉ giao hàng'
  }),
  payment_method: Joi.string().valid('CASH', 'MOMO', 'ZALOPAY').default('CASH'),
  items: Joi.array().items(
    Joi.object({
      food_id: Joi.number().required(),
      quantity: Joi.number().min(1).required(),
      option_ids: Joi.array().items(Joi.number()).optional().messages({
          'array.base': 'Option IDs phải là dạng danh sách [1, 2...]'
      })
    })
  ).min(1).required().messages({
    'array.min': 'Đơn hàng phải có ít nhất 1 món'
  })
});