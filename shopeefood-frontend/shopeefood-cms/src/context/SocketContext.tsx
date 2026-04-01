import React, { createContext, useContext, useEffect, useState } from "react";

import type { SocketContextType } from "../types/socket.type";
import { io, type Socket } from "socket.io-client";
import { notification } from "antd";

const SOCKET_URL = 'http://localhost:8080';

export const SocketContext = createContext<SocketContextType>({ socket:null, newOrderTrigger: 0 });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [newOrderTrigger, setNewOrderTrigger] = useState(0);

    useEffect(() => {
        const userInfoString = localStorage.getItem('user');
        if (!userInfoString) return;

        const userInfo = JSON.parse(userInfoString);
        const merchantId = userInfo.id;

        // 1. Khởi tạo Socket
        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        // 2. Vào phòng
        newSocket.emit('join_room', `merchant_${merchantId}`);

        // 3. Lắng nghe đơn mới
        newSocket.on('new_order', (data) => {
            // Nhạc lên
            const audio = new Audio('../../public/mixi.mp3');
            audio.loop = true;
            audio.play().catch(err => console.log("Trình duyệt chặn Auto-play: ", err));

            notification.success({
                message: 'Ting Ting! Đơn Hàng Mới 🔥',
                description: `Mã đơn #${data.orderId}: Khách hàng vừa đặt món, hãy chuẩn bị ngay!`,
                placement: 'topRight',
                duration: 0, 
                onClose: () => {
                    audio.pause();
                    audio.currentTime = 0;
                }
            });

            setNewOrderTrigger(prev => prev + 1);

        })

        return () => {
            newSocket.disconnect();
        };

    },[])

    return (
        <SocketContext.Provider value={{ socket, newOrderTrigger }}>
            {children}
        </SocketContext.Provider>
    );
}

// Hook để xài nhanh
export const useSocket = () => useContext(SocketContext);