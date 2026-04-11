import axiosClient from "./axiosClient";
import { ApiResponse } from "../types/api.types";
import { Order } from "../types/order.types";

export const driverService = {
    // API Hoàn thiện hồ sơ
    setupProfile: (data: {
        full_name: string;
        vehicle_plate: string;
        id_card: string;
        date_of_birth: string;
        avatar: string;
    }) => {
        // Gọi xuống endpoint mà em đã viết ở Backend
        return axiosClient.post<any, ApiResponse<any>>('/driver/profile', data);
    },

    toggleStatus: (isOnline: boolean) => {
        return axiosClient.patch<any, ApiResponse<any>>('/driver/status', { is_online: isOnline });
    },
    getAvailableOrders: () => {
        return axiosClient.get<any, ApiResponse<any[]>>('/driver/orders/available');
    },
    acceptOrder: (orderId: number) => {
        return axiosClient.patch<any, ApiResponse<any>>(`/driver/orders/${orderId}/accept`);
    },
    getActiveOrder: () => {
        return axiosClient.get<any, ApiResponse<Order>>('/driver/orders/active');
    },

    // 2. Cập nhật tiến độ đơn (Đã lấy hàng, Giao thành công...)
    updateOrderStatus: (orderId: number, status: string) => {
        // Gửi status mới lên cho Backend cập nhật
        return axiosClient.patch<any, ApiResponse<any>>(`/driver/orders/${orderId}/status`, { status });
    },
    getDriverStats: () => {
        return axiosClient.get<any, ApiResponse<any>>('/driver/stats');
    }
};