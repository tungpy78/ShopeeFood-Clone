export interface User {
    id: number;
    full_name:string;
    phone: string;
    role: number;
    status: string;
    avatar: string;
}

export interface UserDTO{
    token:string,
    user:User
}

export interface AuthContextType{
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean// Trạng thái đang check token khi vừa mở app
    login: (userData: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}