import { Router } from 'express';
import { addCategory, addFood, createMerchantProfile, createOptionGroupWithOptions, deleteCategory, deleteFood, getFood, getMenuDetail, getMerchantMenu, getMerchantOrders, getMyProfile, getOptionOfGroup, updateCategory, updateFood, updateMerchantProfile, updateOrderStatus } from '../controllers/MerchantController';
import validate from '../middlewares/validateMiddleware';
import { addCategorySchema, createFoodSchema, createMerchantSchema } from '../validations/merchantValidation';

import { authenticate } from '../middlewares/authMiddleware';
const merchantRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Merchant
 *   description: API dành cho Chủ Quán (Quản lý món, đơn hàng)
 */

/**
 * @swagger
 * /merchants/create:
 *   post:
 *     summary: Tạo hồ sơ quán ăn (Sau khi đăng ký Account)
 *     tags: [Merchant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Cơm Tấm Sài Gòn"
 *               address:
 *                 type: string
 *                 example: "123 Nguyễn Văn Cừ"
 *               phone:
 *                 type: string
 *                 example: "0909123456"
 *               open_time:
 *                 type: string
 *                 example: "08:00"
 *               close_time:
 *                 type: string
 *                 example: "22:00"
 *     responses:
 *       201:
 *         description: Tạo quán thành công
 */
merchantRouter.post('/create', 
    authenticate, 
    validate(createMerchantSchema), 
    createMerchantProfile
);



/**
 * @swagger
 * /merchants/my-profile:
 *   get:
 *     summary: Lấy thông tin quán của tôi
 *     tags: [Merchant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin quán thành công
 *       401:
 *         description: Unauthorized
 */
// API: Xem quán của tôi
merchantRouter.get('/my-profile', authenticate, getMyProfile);

merchantRouter.put('/my-profile', authenticate, validate(createMerchantSchema), updateMerchantProfile);

/**
 * @swagger
 * /merchants/categories:
 *   post:
 *     summary: Thêm danh mục món ăn
 *     tags: [Merchant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Món nướng"
 *     responses:
 *       201:
 *         description: Thêm thành công
 */
// Tạo danh mục (POST)
merchantRouter.post('/categories', authenticate, validate(addCategorySchema), addCategory);




/**
 * @swagger
 * /merchants/categories:
 *   get:
 *     summary: Lấy danh sách danh mục món ăn của quán
 *     tags: [Merchant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách danh mục
 *       401:
 *         description: Unauthorized
 */
// Xem danh mục (GET)
merchantRouter.get('/categories', authenticate, getMerchantMenu);

merchantRouter.put('/categories/:categoryId', authenticate, validate(addCategorySchema), updateCategory);

merchantRouter.delete('/categories/:categoryId', authenticate, deleteCategory );

/**
 * @swagger
 * /merchants/foods:
 *   post:
 *     summary: Thêm món ăn mới
 *     tags: [Merchant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: "Sườn bì chả"
 *               price:
 *                 type: number
 *                 example: 35000
 *               description:
 *                 type: string
 *                 example: "Ngon tuyệt cú mèo"
 *     responses:
 *       201:
 *         description: Thêm món thành công
 */
// thêm món
merchantRouter.post('/foods', 
    authenticate, 
    validate(createFoodSchema), // Validate dữ liệu đầu vào
    addFood
);

merchantRouter.get('/foods', authenticate, getFood);
merchantRouter.put('/foods/:foodId', authenticate, validate(createFoodSchema), updateFood);
merchantRouter.delete('/foods/:foodId', authenticate, deleteFood);



/**
 * @swagger
 * /merchants/orders:
 *   get:
 *     summary: Xem danh sách đơn hàng
 *     tags: [Merchant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, COMPLETED]
 *         description: Lọc theo trạng thái đơn
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 */
// 1. Xem danh sách đơn hàng (GET /api/v1/merchants/orders)
merchantRouter.get('/orders', authenticate, getMerchantOrders);




/**
 * @swagger
 * /merchants/orders/{orderId}:
 *   patch:
 *     summary: Cập nhật trạng thái đơn (Duyệt, Gọi ship...)
 *     tags: [Merchant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [CONFIRMED, PREPARING, FINDING_DRIVER]
 *                 example: "CONFIRMED"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */

// 2. Cập nhật trạng thái đơn (PATCH /api/v1/merchants/orders/:orderId)
merchantRouter.patch('/orders/:orderId', authenticate, updateOrderStatus);





merchantRouter.get('/option-groups',authenticate, getOptionOfGroup)

merchantRouter.post('/option-groups-with-options',authenticate, createOptionGroupWithOptions);


// --- ROUTE PUBLIC (KHÔNG CẦN AUTH) ---
/**
 * @swagger
 * /merchants/{id}:
 *   get:
 *     summary: Xem chi tiết quán và menu (Public)
 *     tags: [Merchant]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của quán
 *     responses:
 *       200:
 *         description: Lấy menu quán thành công
 *       404:
 *         description: Quán không tồn tại
 */
merchantRouter.get('/:id', getMenuDetail);

export default merchantRouter;