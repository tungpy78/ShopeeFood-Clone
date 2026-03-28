import axiosClient from "./axiosClient";
import { ApiResponse } from "../types/api.types";

export const orderService = {
    // data gửi lên sẽ bám sát cấu trúc OrderDTO ở Backend
    createOrder: (data: any) => {
        return axiosClient.post<any, ApiResponse<any>>('/orders', data); 
    }
}