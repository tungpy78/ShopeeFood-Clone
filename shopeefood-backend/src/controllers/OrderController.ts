import { Request, Response, NextFunction } from 'express';
import OrderService from '../services/OrderService';
import AppResponse from '../utils/AppResponse';

export const placeOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return AppResponse.error(res, 'Unauthorized', 401);

    const result = await OrderService.createOrder(req.user.id, req.body);

    return AppResponse.success(res, result, 'Đặt hàng thành công!', 201);
  } catch (error) {
    next(error);
  }
};

export const getOrderHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if(!req.user) return AppResponse.error(res, 'Unauthorized', 401);

    const result = await OrderService.getOrderHistory(req.user.id);

    return AppResponse.success(res, result, 'Lịch sử đơn hàng!', 200);
  } catch (error) {
    next(error);
  }
}