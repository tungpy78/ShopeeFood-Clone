import { Request, Response, NextFunction } from 'express';
import AppResponse from '../../utils/AppResponse';
import AuthService from '../../services/admin/AuthService';

export const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AuthService.login(req.body);
        return AppResponse.success(res, result, 'Đăng nhập Admin thành công!');
    } catch (error) { next(error); }
};