// src/config/socket.ts
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

class SocketService {
    public io: Server | null = null;

    // Hàm này chỉ gọi 1 lần duy nhất lúc khởi động server
    public init(httpServer: HttpServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.io.on("connection", (socket: Socket) => {
            console.log(`⚡ Client connected: ${socket.id}`);

            // Merchant hoặc Driver tham gia vào phòng riêng của họ
            // Ví dụ: roomName = "merchant_5"
            socket.on("join_room", (roomName: string) => {
                socket.join(roomName);
                console.log(`User ${socket.id} joined room: ${roomName}`);
            });

            socket.on('driver_online', (driverId) => {
                socket.join('drivers_room'); // Lệnh quan trọng nhất: Nhét vào phòng!
                console.log(`Tài xế ID ${driverId} đã vào phòng chờ nhận đơn (drivers_room)`);
            });

            socket.on('driver_busy', () => {
                socket.leave('drivers_room'); // Đi giao hàng rồi, ra khỏi phòng hóng đơn!
            });
            socket.on('driver_free', () => {
                socket.join('drivers_room'); // Giao xong, quay lại phòng hóng đơn!
            });

            socket.on("disconnect", () => {
                console.log(`Client disconnected: ${socket.id}`);
            });
        });
    }

    // Hàm để lấy instance io sử dụng ở mọi nơi (Services, Controllers)
    public getIO(): Server {
        if (!this.io) {
            throw new Error("Socket.io chưa được khởi tạo!");
        }
        return this.io;
    }
}

// Export một bản thể duy nhất (Singleton Pattern)
export const socketService = new SocketService();