import { Request, Response, NextFunction } from 'express';
import StatisticService from '../../services/StatisticService';
import AppResponse from '../../utils/AppResponse';
export const getMerchantStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const merchantId = req.user?.id;

        const result = await StatisticService.getMerchantStats(Number(merchantId));
        
        return AppResponse.success(res, result, 'Lấy thống kê thành công!', 200);

        
    } catch (error) {
        next(error);
    }
}