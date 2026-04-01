import { Router } from 'express';
import { acceptOrder, completeOrder, getAvailableOrders } from '../controllers/driver/DriverController';

const driverRouter = Router();

// GET /api/v1/driver/orders/available -> Lấy đơn đang tìm tài xế
driverRouter.get('/orders/available', getAvailableOrders);

// PATCH /api/v1/driver/orders/:orderId/accept -> Bấm nhận đơn
driverRouter.patch('/orders/:orderId/accept', acceptOrder);

// PATCH /api/v1/driver/orders/:orderId/complete -> Giao thành công
driverRouter.patch('/orders/:orderId/complete', completeOrder);

export default driverRouter;