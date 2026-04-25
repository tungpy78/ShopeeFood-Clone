import bcrypt from 'bcryptjs';
import { LoginDTO } from "../../interfaces/auth.interface";
import { Account } from "../../models";
import ApiError from "../../utils/ErrorClass";
import JwtProvider from '../../providers/JwtProvider';
import { JwtPayload, Secret } from 'jsonwebtoken';

class AdminAuthService {
    static async login(data: LoginDTO) {
        const account = await Account.findOne({ where: { phone: data.phone } });
        if (!account) throw new ApiError('Số điện thoại hoặc mật khẩu không đúng!', 401);
        
        if (account.role_id !== 1) throw new ApiError('CẢNH BÁO BẢO MẬT: Bạn không phải là Admin!', 403);
        if (!account.status) throw new ApiError('Tài khoản Admin đã bị khóa!', 403);

        const isMatch = await bcrypt.compare(data.password, account.password);
        if (!isMatch) throw new ApiError('Số điện thoại hoặc mật khẩu không đúng!', 401);

        const token = JwtProvider.generateToken(
            { id: account.id, role: account.role_id },
            process.env.JWT_SECRET as Secret,
            process.env.JWT_EXPIRES_IN as JwtPayload['exp']
        );

        return { token, user: { id: account.id, phone: account.phone, role: account.role_id } };
    }
}
export default AdminAuthService;