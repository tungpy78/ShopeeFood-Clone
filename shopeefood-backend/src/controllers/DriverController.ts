import { Request, Response, NextFunction } from 'express';
import DriverService from '../services/DriverService';
import AppResponse from '../utils/AppResponse';

export const getAvailableOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return AppResponse.error(res, 'Unauthorized', 401);
        const result = await DriverService.getAvailableOrders(req.user.id);
        return AppResponse.success(res, result, 'Danh sách đơn hàng lân cận');
    } catch (error) {
        next(error);
    }
};

export const acceptOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return AppResponse.error(res, 'Unauthorized', 401);
        const { orderId } = req.params;
        const result = await DriverService.acceptOrder(req.user.id, Number(orderId));
        return AppResponse.success(res, result, 'Nhận đơn thành công! Hãy đến quán ngay.');
    } catch (error) {
        next(error);
    }
};

export const completeOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return AppResponse.error(res, 'Unauthorized', 401);
        const { orderId } = req.params;
        const result = await DriverService.completeOrder(req.user.id, Number(orderId));
        return AppResponse.success(res, result, 'Giao hàng thành công! Tiền đã về ví.');
    } catch (error) {
        next(error);
    }
};