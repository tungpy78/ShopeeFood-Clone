import { Request, Response, NextFunction } from 'express';
import { LoginDTO, RegisterDTO } from "../../interfaces/auth.interface";

import AppResponse from '../../utils/AppResponse';
import AuthService from '../../services/customer/AuthService';

export const customerRegister = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AuthService.register(req.body);
        return AppResponse.success(res, result, 'Đăng ký khách hàng thành công!', 201);
    } catch (error) { next(error); }
};

export const customerLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await AuthService.login(req.body);
        return AppResponse.success(res, result, 'Đăng nhập khách hàng thành công!');
    } catch (error) { next(error); }
};