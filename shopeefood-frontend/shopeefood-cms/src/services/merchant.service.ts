import type { ApiResponse } from "../types/api.type";
import type { CreateMerchantRequest, DashboardData } from "../types/merchant.type";
import type { OptionGroup } from "../types/option.type";
import axiosClient from "./axiosClient";

export const merchantService ={
    // Lấy thông tin
    getProfile: () => {
        return axiosClient.get('/merchant/profile');
    },

    
    // Tạo quán mới (POST)
    create: (data: CreateMerchantRequest) => {
        return axiosClient.post<any, ApiResponse<CreateMerchantRequest>>('/merchant/profile', data);
    },

    // Cập nhật quán (PATCH) - Giả sử em đã có API này hoặc dùng chung logic
    update: (data: CreateMerchantRequest) => {
        // Nếu em chưa làm API update riêng thì tạm thời dùng logic create hoặc bổ sung sau
        // Ở đây thầy ví dụ là em có API update
        return axiosClient.put<any, ApiResponse<CreateMerchantRequest>>('/merchant/profile', data); 
    },

    getDashboardStats: () => {
        return axiosClient.get<any, ApiResponse<DashboardData>>('/merchant/stats');
    },

    uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return axiosClient.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    createOptionGroupWithOptions: (data: OptionGroup) =>  axiosClient.post(`/merchant/option-groups`, data)
    
};