// Định nghĩa khuôn mẫu dữ liệu đăng ký
export interface RegisterDTO {
    phone: string;
    password: string;
    full_name?: string;
    role_id?: number;
}
// Định nghĩa khuôn mẫu dữ liệu đăng nhập

export interface LoginDTO {
    phone: string;
    password: string;
}

export interface JwtAccessPayload {
  id: number;
  role: number;
}
// Định nghĩa khuôn mẫu dữ liệu trả về khi đăng nhập thành công
export interface infoDTO {
    id: number;
    phone: string;
    full_name: string;
    role: string;
}