import { Router } from 'express';
import { getAvailableOrders, acceptOrder, completeOrder } from '../controllers/DriverController';
import { authenticate } from '../middlewares/authMiddleware';

const driverRouter = Router();
/**
 * @swagger
 * tags:
 *   name: Driver
 *   description: API dành cho Tài xế (Nhận và giao đơn)
 */


/**
 * @swagger
 * /driver/available-orders:
 *   get:
 *     summary: Lấy danh sách đơn hàng đang tìm tài xế
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng khả dụng
 *       400:
 *         description: Tài xế đang Offline
 *       401:
 *         description: Unauthorized
 */
// 1. Xem đơn (GET)
driverRouter.get('/available-orders', authenticate, getAvailableOrders);

/**
 * @swagger
 * /driver/orders/{orderId}/accept:
 *   patch:
 *     summary: Tài xế nhận đơn hàng
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID đơn hàng cần nhận
 *     responses:
 *       200:
 *         description: Nhận đơn thành công
 *       404:
 *         description: Đơn hàng không tồn tại
 *       409:
 *         description: Đơn đã có tài xế khác nhận
 *       401:
 *         description: Unauthorized
 */


/**
 * @swagger
 * /driver/orders/{orderId}/complete:
 *   patch:
 *     summary: Hoàn thành đơn hàng (đã giao xong)
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID đơn hàng cần hoàn thành
 *     responses:
 *       200:
 *         description: Giao hàng thành công
 *       404:
 *         description: Đơn hàng không hợp lệ
 *       401:
 *         description: Unauthorized
 */

// 2. Nhận đơn (PATCH)
driverRouter.patch('/orders/:orderId/accept', authenticate, acceptOrder);


/**
 * @swagger
 * /driver/orders/{orderId}/complete:
 *   patch:
 *     summary: Hoàn thành đơn hàng (đã giao xong)
 *     tags: [Driver]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID đơn hàng cần hoàn thành
 *     responses:
 *       200:
 *         description: Giao hàng thành công
 *       404:
 *         description: Đơn hàng không hợp lệ
 *       401:
 *         description: Unauthorized
 */

// 3. Hoàn thành đơn (PATCH)
driverRouter.patch('/orders/:orderId/complete', authenticate, completeOrder);

export default driverRouter;