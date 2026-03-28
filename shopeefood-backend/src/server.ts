import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB, sequelize } from './config/connectDB';
import './models/index';
import errorHandlingMiddleware from './middlewares/errorMiddleware';
import rootRouter from './routes';
import { seedRoles } from './utils/seeder';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware cơ bản
app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- 1. CẤU HÌNH SOCKET.IO (Đưa lên trên cùng) ---
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  // --- THÊM ĐOẠN NÀY: SỰ KIỆN VÀO PHÒNG ---
  // Client (Frontend) sẽ gửi lên sự kiện này để xin vào phòng của quán mình
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    console.log(`User ${socket.id} joined room: ${roomName}`);
  });
  // ---------------------------------------

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// --- 2. QUAN TRỌNG: Inject Socket vào Req (PHẢI ĐẶT TRƯỚC ROUTER) ---
app.use((req: any, res, next) => {
  req.io = io; // Gán io vào request để controller dùng
  next();
});

// --- 3. Routing (Bây giờ mới được gọi Router) ---
app.use('/api/v1', rootRouter);

// Test route
app.get('/', (req, res) => {
  res.send('ShopeeFood Backend is Running! 🚀');
});

// 4. Error Handling
app.use(errorHandlingMiddleware);

// 5. Start Server
httpServer.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  await connectDB();
  
  try {
    await sequelize.sync({ alter: true });
    await seedRoles();
    console.log('✅ Database & Tables synced successfully!');
  } catch (error) {
    console.error('❌ Failed to sync database:', error);
  }
});