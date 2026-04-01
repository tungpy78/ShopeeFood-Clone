import { Request, Response, NextFunction } from 'express';
import AppResponse from '../../utils/AppResponse';
import AuthService from '../../services/driver/AuthService';

export const driverRegister = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AuthService.register(req.body);
        return AppResponse.success(res, result, 'Đăng ký tài xế thành công! Vui lòng chờ duyệt.', 201);
    } catch (error) { next(error); }
};

export const driverLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AuthService.login(req.body);
        return AppResponse.success(res, result, 'Đăng nhập tài xế thành công!');
    } catch (error) { next(error); }
};