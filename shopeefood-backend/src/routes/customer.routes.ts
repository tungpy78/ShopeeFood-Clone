import { Router } from 'express';
import validate from '../middlewares/validateMiddleware';
import { createOrderSchema } from '../validations/orderValidation';
import { getOrderHistory, placeOrder } from '../controllers/customer/OrderController';

const customerRouter = Router();

// ĐẶT HÀNG: POST /api/v1/customer/orders
customerRouter.post('/orders', validate(createOrderSchema), placeOrder);

// LỊCH SỬ ĐƠN: GET /api/v1/customer/orders
customerRouter.get('/orders', getOrderHistory);

export default customerRouter;