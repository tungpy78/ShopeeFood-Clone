import axiosClient from './axiosClient';
// Import các Type/Interface để code an toàn hơn
import type { AuthData, LoginRequest, RegisterRequest, User } from '../types/auth.type';
import type { ApiResponse } from '../types/api.type';

export const authService = {
  login: (data: LoginRequest)  => {
    return axiosClient.post<any, ApiResponse<AuthData>>('/auth/login', data);
  },

  register: (data: RegisterRequest)  => {
    return axiosClient.post<any, ApiResponse<AuthData>>('/auth/register', data);
  },

  getProfile: () => {
    return axiosClient.get<any, ApiResponse<User>>('/auth/me');
  },
  
  // Sau này backend làm đổi pass thì thêm vào đây
  changePassword: (data: any) => {
    return axiosClient.patch<any, ApiResponse<null>>('/auth/change-password', data);
  }
};