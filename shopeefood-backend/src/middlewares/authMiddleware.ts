// Bỏ import jwt cũ
import { Request, Response, NextFunction } from 'express';
import JwtProvider from '../providers/JwtProvider';
import AppResponse from '../utils/AppResponse';
import { infoDTO } from '../interfaces/auth.interface';

// ...

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return AppResponse.error(res, 'Bạn chưa đăng nhập!', 401);
    }

    const token = authHeader.split(' ')[1];

    // --- THAY ĐỔI ĐOẠN VERIFY ---
    // Cũ: const decoded = jwt.verify(...)

    // Mới: Nhờ chuyên gia check
    const decoded = JwtProvider.verifyToken(token, process.env.JWT_SECRET as string);

    req.user = decoded as infoDTO;
    next();

  } catch (error) {
    // Vì bên Provider mình đã throw Error nên ở đây sẽ bắt được
    return AppResponse.error(res, 'Token không hợp lệ hoặc đã hết hạn!', 401);
  }
};