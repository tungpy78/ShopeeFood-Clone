import { Router } from 'express';
import { login, register } from '../controllers/AuthController'; // Import Controller (Lễ tân)
import validate from '../middlewares/validateMiddleware';
import { loginSchema, registerSchema } from '../validations/authValidation';

const authRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API Đăng ký và Đăng nhập
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - password
 *               - full_name
 *               - role_id
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "0909123456"
 *               password:
 *                 type: string
 *                 example: "123456"
 *               full_name:
 *                 type: string
 *                 example: "Nguyễn Văn A"
 *               role_id:
 *                 type: integer
 *                 example: 2
 *                 description: "1: Merchant, 2: Customer, 3: Driver"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Lỗi Validation
 */
authRouter.post('/register',validate(registerSchema) ,register);

authRouter.post('/login', validate(loginSchema), login);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Đăng nhập hệ thống
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - password
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "0999999999"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về Token
 *       401:
 *         description: Sai mật khẩu hoặc tài khoản
 */



export default authRouter;