import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { authorize } from '../middlewares/authorize'; // Nhớ check lại middleware authorize của em nhé

import authRouter from './auth.routes';
import merchantRouter from './merchant.routes';
import driverRouter from './driver.routes';
import adminRouter from './admin.routes';
import uploadRouter from './upload.routes';
import publicRouter from './public.routes';
import customerRouter from './customer.routes';


const rootRouter = Router();

// ==========================================
// 🟢 NHÁNH PUBLIC (Không cần đăng nhập)
// ==========================================
rootRouter.use('/auth', authRouter); // Đăng ký, Đăng nhập
rootRouter.use('/public', publicRouter); // Khách vãng lai xem danh sách quán, xem menu...
rootRouter.use('/upload', uploadRouter); // Upload ảnh (có thể để public hoặc auth tùy em)

// ==========================================
// 🔵 NHÁNH CUSTOMER (Bảo vệ chặn cửa: Phải Login + Role Customer)
// ==========================================
// Giả sử Role Customer = 'Customer' hoặc ID = 2 tùy cách em viết middleware authorize
rootRouter.use('/customer', authenticate, customerRouter);

// ==========================================
// 🟠 NHÁNH MERCHANT (Bảo vệ chặn cửa: Phải Login + Role Merchant)
// ==========================================
rootRouter.use('/merchant', authenticate, authorize(['Merchant']), merchantRouter);

// ==========================================
// 🟣 NHÁNH DRIVER (Bảo vệ chặn cửa: Phải Login + Role Driver)
// ==========================================
rootRouter.use('/driver', authenticate, authorize(['Driver']), driverRouter);

// ==========================================
// 🔴 NHÁNH ADMIN (Bảo vệ chặn cửa: Phải Login + Role Admin)
// ==========================================
rootRouter.use('/admin', authenticate, authorize(['Admin']), adminRouter);

export default rootRouter;