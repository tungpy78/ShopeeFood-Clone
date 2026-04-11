import { Router } from 'express';
import { acceptOrder, completeOrder, getActiveOrder, getAvailableOrders, getDriverProfile, getDriverStats, setupProfile, toggleStatus, updateOrderStatus } from '../controllers/driver/DriverController';

const driverRouter = Router();

// --- 1. PROFILE & TRẠNG THÁI ---
driverRouter.get('/profile', getDriverProfile);
driverRouter.post('/profile', setupProfile)
driverRouter.patch('/status', toggleStatus);

// --- 2. ĐƠN HÀNG ---
driverRouter.get('/orders/available', getAvailableOrders);
driverRouter.get('/orders/active', getActiveOrder); // Đơn đang giao
driverRouter.patch('/orders/:orderId/accept', acceptOrder);
driverRouter.patch('/orders/:orderId/complete', completeOrder);
driverRouter.patch('/orders/:orderId/status', updateOrderStatus)

// --- 3. THỐNG KÊ ---
driverRouter.get('/stats', getDriverStats);

export default driverRouter;