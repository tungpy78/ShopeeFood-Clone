import { ApiResponse } from "../types/api.types"
import { UserDTO } from "../types/auth.types"
import axiosClient from "./axiosClient"

export const AuthService = {
    login:(phone: string, password: string) => {
        return axiosClient.post<any, ApiResponse<UserDTO>>('auth/login',
            {
                phone,
                password
            }
        );
    }
}