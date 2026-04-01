import type { ApiResponse } from "../types/api.type";
import type { CreateFoodRequest, Food } from "../types/food.type";
import type { OptionGroup } from "../types/option.type";
import axiosClient from "./axiosClient";


export const foodService = {
    getAll: () => axiosClient.get<any, ApiResponse<CreateFoodRequest[]>>('/merchant/foods'), // Lấy danh sách món của quán mình
    create: (data: CreateFoodRequest) => axiosClient.post<any, ApiResponse<CreateFoodRequest>>('/merchant/foods', data),
    update: (id: number, data: CreateFoodRequest) => axiosClient.put<any, ApiResponse<Food>>(`/merchant/foods/${id}`, data),
    delete: (id: number) => axiosClient.delete<any, ApiResponse<any>>(`/merchants/foods/${id}`),

    getOptionGroups: () => axiosClient.get<any, ApiResponse<OptionGroup[]>>(`/merchant/option-groups`),
};