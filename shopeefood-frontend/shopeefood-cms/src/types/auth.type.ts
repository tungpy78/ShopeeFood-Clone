export interface AuthData {
    token: string;
    user: User;
}

// Định nghĩa dữ liệu User trả về từ Backend
export interface User {
  id: number;
  phone: string;
  full_name: string;
  role_id: number;
  email?: string;
}
export interface LoginRequest {
  phone: string;
  password?: string;
}

export interface RegisterRequest {
  phone: string;
  password?: string;
  full_name: string;
  role_id?: number; 
}
