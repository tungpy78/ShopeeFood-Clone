import React, { createContext, useContext, useEffect, useState } from "react";
import { SocketContextType } from "../types/socket.types";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { Alert, Vibration } from "react-native";

const SOCKET_URL = 'http://192.168.1.100:8080';

export const SocketContext = createContext<SocketContextType>({ socket: null, orderUpdateTrigger:0 });

export const SocketProvider = ({children}: {children: React.ReactNode}) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [orderUpdateTrigger, setOrderUpdateTrigger] = useState(0);

    // Lấy thông tin user đăng nhập từ AuthContext
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        // 1. Khởi tạo Socket
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        // 2. Vào phòng dành riêng cho khách hàng này (ID của user)
        newSocket.emit('join_room', `customer_${user.id}`);

        // 3. Lắng nghe thông báo trạng thái đơn hàng
        newSocket.on('order_status_update', (data) => {
            Vibration.vibrate([0, 400, 200, 400]);
            
            Alert.alert(
                'Cập nhật đơn hàng 🚀', 
                data.message,
                [{ text: 'Tuyệt vời' }]
            );
           // Tăng biến trigger lên 1 để báo cho màn hình Orders biết có biến
            setOrderUpdateTrigger(prev => prev + 1); 
        });

        return () => {
            newSocket.disconnect();
        };

    },[isAuthenticated, user])

    return (
        <SocketContext.Provider value={{ socket, orderUpdateTrigger }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => useContext(SocketContext);