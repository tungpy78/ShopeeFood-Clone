import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorize';
import { getAdminStats, getMerchantStats } from '../controllers/StatisticController';

const statisticRouter = Router();
/**
 * @swagger
 * tags:
 *   name: Statistic
 *   description: API thống kê cho Merchant và Admin
 */     


/**
 * @swagger
 * /statistics/merchant:
 *   get:
 *     summary: Lấy thống kê doanh thu cho quán của tôi (Merchant)
 *     tags: [Statistic]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy thống kê thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 revenueToday:
 *                   type: number
 *                   example: 150000
 *                 orderToday:
 *                   type: number
 *                   example: 5
 *                 totalRevenue:
 *                   type: number
 *                   example: 3500000
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Quán không tồn tại
 */

// Route cho Chủ quán
statisticRouter.get('/merchant', authenticate, authorize(['Merchant']), getMerchantStats);




/**
 * @swagger
 * /statistics/admin:
 *   get:
 *     summary: Lấy thống kê toàn hệ thống (Admin)
 *     tags: [Statistic]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê hệ thống thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalMerchants:
 *                   type: number
 *                   example: 20
 *                 totalOrders:
 *                   type: number
 *                   example: 500
 *                 total_drivers:
 *                   type: number
 *                   example: 15
 *                 totalRevenue:
 *                   type: number
 *                   example: 12000000
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Không có quyền Admin
 */

// Route cho Admin (MỚI)
// Yêu cầu: Phải đăng nhập + Phải là Admin (Role 4)
statisticRouter.get('/admin', 
    authenticate, 
    authorize(['Admin']), 
    getAdminStats
);

export default statisticRouter;