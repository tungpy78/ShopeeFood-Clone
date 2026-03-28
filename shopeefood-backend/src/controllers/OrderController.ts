import { Request, Response, NextFunction } from 'express';
import OrderService from '../services/OrderService';
import AppResponse from '../utils/AppResponse';

export const placeOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return AppResponse.error(res, 'Unauthorized', 401);

    const result = await OrderService.createOrder(req.user.id, req.body);

    const roomName = `merchant_${result.merchant_id}`;

    // 2. --- REAL-TIME MAGIC ---
    // Gửi sự kiện 'new_order' tới tất cả mọi người (Sau này sẽ lọc chỉ gửi cho đúng quán)
    req.io.to(roomName).emit('new_order', { 
       message: '🔔 Ting ting! Quán bạn có đơn mới!',
        order: result
    });
    console.log(`⚡ Đã bắn socket tới phòng: ${roomName}`);
    // -------------------------

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