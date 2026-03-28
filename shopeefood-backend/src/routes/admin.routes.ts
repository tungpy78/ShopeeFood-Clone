import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorize';
import { getPendingMerchants, approveMerchant } from '../controllers/AdminController';

const adminRouter = Router();



// Middleware chung cho cả nhóm Admin: Phải đăng nhập VÀ Phải là Admin
adminRouter.use(authenticate, authorize(['Admin']));

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API dành cho Admin (Duyệt quán)
 */

/**
 * @swagger
 * /admin/merchants/pending:
 *   get:
 *     summary: Lấy danh sách quán đang chờ duyệt
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách quán chờ duyệt
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Không có quyền Admin
 */
// Route xem danh sách chờ
adminRouter.get('/merchants/pending', getPendingMerchants);



/**
 * @swagger
 * /admin/merchants/{merchantId}/approve:
 *   patch:
 *     summary: Duyệt quán (chuyển trạng thái sang ACTIVE)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: merchantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của quán cần duyệt
 *     responses:
 *       200:
 *         description: Duyệt quán thành công
 *       404:
 *         description: Quán không tồn tại
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Không có quyền Admin
 */
// Route duyệt quán
adminRouter.patch('/merchants/:merchantId/approve', approveMerchant);

export default adminRouter;