// src/types/api.type.ts

// Đây là "cái vỏ" cho mọi response thành công từ Backend
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data: T;       // T chính là phần "lõi" (Category, Food, User...) sẽ linh hoạt thay đổi
    status?: number;
}

// Đây là "cái vỏ" cho response khi có lỗi (400, 401, 500...)
export interface ApiErrorResponse {
    success: boolean;
    message: string;
    errors?: any;
}