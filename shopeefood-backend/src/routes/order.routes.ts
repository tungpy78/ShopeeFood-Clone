import { Router } from 'express';
import { getOrderHistory, placeOrder } from '../controllers/OrderController';
import { authenticate } from '../middlewares/authMiddleware';
import validate from '../middlewares/validateMiddleware';
import { createOrderSchema } from '../validations/orderValidation';


const orderRouter = Router();
/**
 * @swagger
 * tags:
 *   name: Order
 *   description: API dành cho Khách hàng (Đặt hàng & xem lịch sử)
 */



/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Khách hàng đặt đơn hàng mới
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               merchant_id:
 *                 type: integer
 *                 example: 1
 *               shipping_address:
 *                 type: string
 *                 example: "123 Nguyễn Văn Cừ, Quận 5"
 *               payment_method:
 *                 type: string
 *                 example: "CASH"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     food_id:
 *                       type: integer
 *                       example: 5
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *                     option_ids:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       example: [1, 3]
 *     responses:
 *       201:
 *         description: Đặt hàng thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Quán hoặc món ăn không tồn tại
 */

// API Đặt hàng (POST)
orderRouter.post('/', 
    authenticate, 
    validate(createOrderSchema), 
    placeOrder
);


/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Lấy lịch sử đơn hàng của khách hàng
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 *       401:
 *         description: Unauthorized
 */

orderRouter.get('/',
    authenticate,
    getOrderHistory
);
export default orderRouter;