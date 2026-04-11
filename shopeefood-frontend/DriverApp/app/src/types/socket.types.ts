import { Socket } from "socket.io-client";

export interface SocketContextType {
    socket: Socket | null;
    isOnline: boolean;
    toggleOnline: () => Promise<void>;
    loadingToggle: boolean;
    orderUpdateTrigger: number;
}


