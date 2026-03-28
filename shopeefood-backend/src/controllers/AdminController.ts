import { Request, Response, NextFunction } from 'express';
import AdminService from '../services/AdminService';
import AppResponse from '../utils/AppResponse';

export const getPendingMerchants = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const merchants = await AdminService.getPendingMerchants();
        return AppResponse.success(res, merchants, 'Danh sách quán chờ duyệt');
    } catch (error) {
        next(error);
    }
}
export const approveMerchant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {merchantId} = req.params;

        const merchant = await AdminService.approveMerchant(Number(merchantId));

        return AppResponse.success(res, merchant, 'Đã duyệt quán thành công!')
        
    } catch (error) {
        next(error);
    }
}