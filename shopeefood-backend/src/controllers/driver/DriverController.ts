import { Request, Response, NextFunction } from 'express';
import AppResponse from '../../utils/AppResponse';
import DriverService from '../../services/driver/DriverService';
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

export const getDriverProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return AppResponse.error(res, 'Unauthorized', 401);
        const result = await DriverService.getDriverProfile(req.user.id);
        return AppResponse.success(res, result, 'Lấy profile thành công');
    } catch (error) { next(error); }
};

export const toggleStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return AppResponse.error(res, 'Unauthorized', 401);
        const { is_online } = req.body;
        const result = await DriverService.toggleStatus(req.user.id, Boolean(is_online));
        return AppResponse.success(res, result, is_online ? 'Bạn đã Trực tuyến, sẵn sàng nhận đơn!' : 'Bạn đã Ngoại tuyến.');
    } catch (error) { next(error); }
};

export const getActiveOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return AppResponse.error(res, 'Unauthorized', 401);
        const result = await DriverService.getActiveOrder(req.user.id);
        return AppResponse.success(res, result, 'Lấy đơn đang giao thành công');
    } catch (error) { next(error); }
};

export const getRevenueChart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return AppResponse.error(res, 'Unauthorized', 401);
        const result = await DriverService.getRevenueChart(req.user.id);
        return AppResponse.success(res, result, 'Lấy thống kê thành công');
    } catch (error) { next(error); }
};

export const setupProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.user) return AppResponse.error(res, 'Unauthorized', 401);
        const result = await DriverService.setupProfile(req.user.id, req.body);
        return AppResponse.success(res, result, 'Cập nhật hồ sơ thành công, Vui lòng đợi Admin duyệt trong vòng 24h !')
    } catch (error) {
        next(error); 
    }
}

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        
        if(!user) return AppResponse.error(res, 'Unauthorized', 401);
        const {orderId} = req.params;
        const {status} = req.body;

        const result = await DriverService.updateOrderStatus(user.id, Number(orderId), status);
        
        return AppResponse.success(res, result, 'Cập nhật tiến độ thành công!', 200);

    } catch (error) {
        next(error)
    }
}
export const getWalletInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        if(!user) return AppResponse.error(res, 'Unauthorized', 401);
        const result = await DriverService.getWalletInfo(user.id);
        return AppResponse.success(res, result, 'Lấy thông tin ví thành công!', 200);
    } catch (error) {
        next(error)
    }
}