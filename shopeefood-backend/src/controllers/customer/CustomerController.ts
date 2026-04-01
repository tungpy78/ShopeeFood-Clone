import { Request, Response, NextFunction } from 'express';
import CustomerService from '../../services/customer/CustomerService';
import AppResponse from '../../utils/AppResponse';

export const getMerchant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await CustomerService.getMerchant();
        return AppResponse.success(res, result, "Lấy danh sách quán thành công", 200);
    } catch (error) {
        next(error)
    }
}