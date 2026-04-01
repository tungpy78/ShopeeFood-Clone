import { Router } from 'express';
import { getMerchant } from '../controllers/customer/CustomerController';
import { getMenuDetail } from '../controllers/merchant/MerchantController';


const publicRouter = Router();

// GET /api/v1/public/merchants -> Lấy danh sách tất cả quán ăn
publicRouter.get('/merchants', getMerchant);

// GET /api/v1/public/merchants/:id -> Xem chi tiết menu của 1 quán
publicRouter.get('/merchants/:id', getMenuDetail);

export default publicRouter;