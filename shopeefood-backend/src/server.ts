// src/server.ts
import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB, sequelize } from './config/connectDB';
import './models/index';
import errorHandlingMiddleware from './middlewares/errorMiddleware';
import rootRouter from './routes';
import { seedRoles } from './utils/seeder';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';

// IMPORT FILE SOCKET MỚI
import { socketService } from './config/socket'; 

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const httpServer = createServer(app);

// --- 1. KHỞI TẠO SOCKET.IO (GỌN GÀNG HƠN RẤT NHIỀU) ---
socketService.init(httpServer);
// Lưu ý: Ta đã xóa middleware gán req.io đi vì không cần thiết nữa.

// --- 2. Routing ---
app.use('/api/v1', rootRouter);

app.get('/', (req, res) => {
  res.send('ShopeeFood Backend is Running! 🚀');
});

// 3. Error Handling
app.use(errorHandlingMiddleware);

// 4. Start Server
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