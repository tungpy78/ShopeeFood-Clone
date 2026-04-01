import { Router } from 'express';
import validate from '../middlewares/validateMiddleware';
import { customerDriverRegisterSchema, loginSchema, merchantRegisterSchema } from '../validations/authValidation';
import { customerLogin, customerRegister } from '../controllers/customer/AuthController';
import { merchantLogin, merchantRegister } from '../controllers/merchant/AuthController';
import { driverLogin, driverRegister } from '../controllers/driver/AuthController';
import { adminLogin } from '../controllers/admin/AuthController';

const authRouter = Router();

// ==========================================
// 1. AUTH DÀNH CHO KHÁCH HÀNG (Customer App)
// ==========================================
authRouter.post('/customer/register', validate(customerDriverRegisterSchema), customerRegister);
authRouter.post('/customer/login', validate(loginSchema), customerLogin);

// ==========================================
// 2. AUTH DÀNH CHO CHỦ QUÁN (Merchant Web)
// ==========================================
authRouter.post('/merchant/register', validate(merchantRegisterSchema), merchantRegister);
authRouter.post('/merchant/login', validate(loginSchema), merchantLogin);

// ==========================================
// 3. AUTH DÀNH CHO TÀI XẾ (Driver App)
// ==========================================
authRouter.post('/driver/register', validate(customerDriverRegisterSchema), driverRegister);
authRouter.post('/driver/login', validate(loginSchema), driverLogin);

// ==========================================
// 4. AUTH DÀNH CHO ADMIN (Admin Dashboard)
// ==========================================
authRouter.post('/admin/login', validate(loginSchema), adminLogin);

export default authRouter;