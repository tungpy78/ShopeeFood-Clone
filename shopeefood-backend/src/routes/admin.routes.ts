import { Router } from 'express';
import { approveMerchant, getPendingMerchants } from '../controllers/admin/AdminController';
import { getAdminStats } from '../controllers/admin/StatisticController';


const adminRouter = Router();

// DUYỆT QUÁN: GET /api/v1/admin/merchants/pending
adminRouter.get('/merchants/pending', getPendingMerchants);
adminRouter.patch('/merchants/:merchantId/approve', approveMerchant);

// THỐNG KÊ: GET /api/v1/admin/stats
adminRouter.get('/stats', getAdminStats);

export default adminRouter;