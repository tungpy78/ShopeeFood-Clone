import type { ApiResponse } from "../types/api.type"
import type { Category } from "../types/category.type"
import axiosClient from "./axiosClient"

export const CategoryService = {
    // 1. Lấy danh sách (Read)
    getAll: () => {
        return axiosClient.get<any, ApiResponse<Category[]>>('/merchants/categories')
    },
    // 2. Tạo mới (Create)
    create: (data: Category) => {
        return axiosClient.post<any, ApiResponse<Category>>('/merchants/categories', data)
    },
    // 3. Cập nhật (Update)
    update: (id: number, data: Category) => {
        return axiosClient.put<any, ApiResponse<Category>>(`/merchants/categories/${id}`, data)
    },
    // 4. Xóa (Delete)
    delete: (id: number) => {
        return axiosClient.delete<any, ApiResponse<null>>(`/merchants/categories/${id}`);
    }
}