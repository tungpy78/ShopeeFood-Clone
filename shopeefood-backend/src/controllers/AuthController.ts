import { Request, Response, NextFunction } from 'express';
import { LoginDTO, RegisterDTO } from "../interfaces/auth.interface";
import AuthService from '../services/AuthService';
import AppResponse from '../utils/AppResponse';

export const register = async (req: Request, res: Response, next: NextFunction) =>{
    try {
        const playload: RegisterDTO = req.body;

        // Gọi Service
        const newAccount = await AuthService.registerUser(playload);

        // Thành công: Dùng AppResponse trả về
        return AppResponse.success(res, newAccount, 'Đăng ký thành công!', 201);
    } catch (error) {
        // Lỗi: Đẩy sang middleware xử lý (Bỏ luôn đoạn check 409/500 ở đây đi)
        // Middleware sẽ tự lo việc format lỗi bằng AppResponse
        next(error);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) =>{
    try {
        const playload: LoginDTO = req.body;
        // Gọi Service
        const result = await AuthService.loginUser(playload);
        // Thành công: Dùng AppResponse trả về
        return AppResponse.success(res, result, 'Đăng nhập thành công!', 200);
    } catch (error) {
        next(error);
    }
}