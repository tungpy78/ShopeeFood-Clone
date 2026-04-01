import bcrypt from 'bcryptjs';
import { JwtPayload, Secret } from 'jsonwebtoken';
import { LoginDTO, RegisterDTO } from '../../interfaces/auth.interface';
import { Account } from '../../models';
import ApiError from '../../utils/ErrorClass';
import JwtProvider from '../../providers/JwtProvider';

class MerchantAuthService {
    static async register(data: RegisterDTO) {
        const existingAccount = await Account.findOne({ where: { phone: data.phone } });
        if (existingAccount) throw new ApiError('Số điện thoại này đã được sử dụng!', 409);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        // Bắt buộc Role = 1. KHÔNG tạo Profile Merchant ở đây (sẽ tạo sau khi login)
        const newAccount = await Account.create({
            phone: data.phone,
            password: hashedPassword,
            role_id: 4, 
            status: true
        });

        return newAccount;
    }

    static async login(data: LoginDTO) {
        const account = await Account.findOne({ where: { phone: data.phone } });
        if (!account) throw new ApiError('Số điện thoại hoặc mật khẩu không đúng!', 401);
        
        // Chặn nếu không phải Chủ quán
        if (account.role_id !== 4) throw new ApiError('Tài khoản không có quyền truy cập kênh Chủ quán!', 403);
        if (!account.status) throw new ApiError('Tài khoản của bạn đã bị khóa!', 403);

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
export default MerchantAuthService;