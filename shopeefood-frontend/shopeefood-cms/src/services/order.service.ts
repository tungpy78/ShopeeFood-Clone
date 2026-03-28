import type { ApiResponse } from "../types/api.type";
import type { Order } from "../types/order.type";
import axiosClient from "./axiosClient";


export const orderService = {
  // Lấy danh sách đơn hàng của quán (có thể truyền params để lọc theo status)
  getMyOrders: (status?: string) => {
    // Nếu có truyền status (ví dụ: ?status=PENDING), API sẽ chỉ trả về đơn PENDING
    const url = status ? `/merchants/orders?status=${status}` : '/merchants/orders';
    return axiosClient.get<any, ApiResponse<Order[]>>(url);
  },

  // Cập nhật trạng thái đơn hàng (Dùng khi chủ quán bấm nút "Nhận đơn" hoặc "Hủy đơn")
  updateOrderStatus: (orderId: number, newStatus: string) => {
    return axiosClient.patch<any, ApiResponse<any>>(`/merchants/orders/${orderId}`, { status: newStatus });
  }
};