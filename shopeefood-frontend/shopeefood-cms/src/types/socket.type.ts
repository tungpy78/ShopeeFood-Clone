import type { Socket } from "socket.io-client";

export interface SocketContextType {
    socket: Socket | null;
    newOrderTrigger: number; // Biến này dùng để "đá lông nheo" cho OrderPage biết mà load lại đơn
}