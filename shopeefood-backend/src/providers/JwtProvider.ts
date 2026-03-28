import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';
import { JwtAccessPayload } from '../interfaces/auth.interface';

class JwtProvider {
  /**
   * Tạo Token mới
   * @param payload Dữ liệu muốn lưu vào token (vd: {id, role})
   * @param secretKey Chữ ký bí mật
   * @param expiresIn Thời gian hết hạn (vd: '1h', '7d')
   */
  static generateToken(payload: JwtAccessPayload, secretKey: Secret, expiresIn: SignOptions['expiresIn']): string {
    return jwt.sign(payload, secretKey, { expiresIn });
  }

  /**
   * Kiểm tra Token
   * @param token Chuỗi token cần kiểm tra
   * @param secretKey Chữ ký bí mật
   */
  static verifyToken(token: string, secretKey: string): JwtPayload | string {
    try {
      return jwt.verify(token, secretKey);
    } catch (error) {
      // Nếu lỗi (hết hạn, sai chữ ký...) thì ném ra null hoặc lỗi cụ thể
      throw new Error('Token không hợp lệ hoặc đã hết hạn!'); 
    }
  }
}

export default JwtProvider;