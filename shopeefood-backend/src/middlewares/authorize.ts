import { Request, Response, NextFunction } from 'express';
import AppResponse from '../utils/AppResponse';

// Hàm này nhận vào danh sách các Role được phép truy cập
// Ví dụ: authorize(['Admin', 'Merchant'])
export const authorize = (allowedRoles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        const user = req.user; // Lấy user từ middleware authenticate trước đó
        console.log('User in authorize middleware:', user);

        if (!user) {
            return AppResponse.error(res, 'Unauthorized', 401);
        }

        // Map role_id sang tên Role (hoặc em có thể check trực tiếp role_id)
        // Quy ước của mình: 1: Admin, 2: Customer, 3: Driver, 4: Merchant
        const roleMap: Record<number, string> = {
            1: 'Admin',
            2: 'Customer',
            3: 'Driver',
            4: 'Merchant'
        };

        const userRole = roleMap[user.role];
        console.log('User role in authorize middleware:', userRole);

        if (!allowedRoles.includes(userRole)) {
            return AppResponse.error(res, 'Bạn không có quyền thực hiện hành động này!', 403);
        }

        next();
    };
};