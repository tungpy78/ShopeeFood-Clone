import axiosClient from "./axiosClient";
import { ApiResponse } from "../types/api.types";
import { Order, OrderHistory } from "../types/customer.types";

export const orderService = {
    // data gửi lên sẽ bám sát cấu trúc OrderDTO ở Backend
    createOrder: (data: any) => {
        return axiosClient.post<any, ApiResponse<Order>>('/orders', data); 
    },

    getMyOrders: () => {
        return axiosClient.get<any, ApiResponse<OrderHistory[]>>('/orders');
    }
}