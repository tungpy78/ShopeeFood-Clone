import { infoDTO } from '../interfaces/auth.interface'; // Import interface của em

declare global {
  namespace Express {
    interface Request {
      user?: infoDTO; // Khai báo thêm user vào Request (dấu ? nghĩa là có thể null)
      io: Server; // Khai báo: req.io sẽ là một cái Server Socket
    }
  }
}