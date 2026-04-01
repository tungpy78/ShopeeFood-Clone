import { Socket } from "socket.io-client";

export interface SocketContextType {
    socket: Socket | null;
    orderUpdateTrigger: number; // Biến kích hoạt để màn hình Orders tự reload
}
