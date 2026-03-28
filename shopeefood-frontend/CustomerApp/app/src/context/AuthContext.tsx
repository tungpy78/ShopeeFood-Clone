import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContextType, User } from '../types/auth.types';


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 1. KHI VỪA MỞ APP LÊN: Đi tìm Token và thông tin User cũ
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('accessToken');
                const storedUser = await AsyncStorage.getItem('userInfo');

                if (storedToken && storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Lỗi khi đọc dữ liệu đăng nhập:', error);
            } finally {
                setIsLoading(false); // Check xong thì tắt loading
            }
        };

        checkLoginStatus();
    }, []);

    // 2. HÀM LOGIN: Gọi hàm này khi người dùng bấm Đăng nhập thành công ở màn hình Login
    const login = async (userData: User, token: string) => {
        try {
            await AsyncStorage.setItem('accessToken', token);
            await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error('Lỗi khi lưu dữ liệu đăng nhập:', error);
        }
    };

    // 3. HÀM LOGOUT: Xóa trắng dữ liệu
    const logout = async () => {
        try {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('userInfo');
            setUser(null);
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isAuthenticated: !!user, // Nếu user có dữ liệu -> true, nếu null -> false
            isLoading, 
            login, 
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook để các màn hình khác xài
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth phải được bọc trong AuthProvider');
    return context;
};