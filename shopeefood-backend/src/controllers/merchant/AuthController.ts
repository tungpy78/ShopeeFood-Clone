import { Request, Response, NextFunction } from 'express';
import AppResponse from '../../utils/AppResponse';
import AuthService from '../../services/merchant/AuthService';

export const merchantRegister = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AuthService.register(req.body);
        return AppResponse.success(res, result, 'Đăng ký tài khoản chủ quán thành công!', 201);
    } catch (error) { next(error); }
};

export const merchantLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AuthService.login(req.body);
        return AppResponse.success(res, result, 'Đăng nhập chủ quán thành công!');
    } catch (error) { next(error); }
};