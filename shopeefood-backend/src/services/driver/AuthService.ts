import bcrypt from 'bcryptjs';
import { LoginDTO, RegisterDTO } from "../../interfaces/auth.interface";
import { Account, Driver } from "../../models";
import ApiError from "../../utils/ErrorClass";
import JwtProvider from '../../providers/JwtProvider';
import { JwtPayload, Secret } from 'jsonwebtoken';

class DriverAuthService {
    static async register(data: RegisterDTO) {
        const existingAccount = await Account.findOne({ where: { phone: data.phone } });
        if (existingAccount) throw new ApiError('Số điện thoại này đã được sử dụng!', 409);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        // Bắt buộc Role = 3
        const newAccount = await Account.create({
            phone: data.phone,
            password: hashedPassword,
            role_id: 3, 
            status: true
        });

        // Tạo Profile Tài xế (Chờ duyệt)
        await Driver.create({
            account_id: newAccount.id,
            full_name: data.full_name || 'Tài xế mới',
            is_online: false
        });

        return newAccount;
    }

    static async login(data: LoginDTO) {
        const account = await Account.findOne({ where: { phone: data.phone } });
        if (!account) throw new ApiError('Số điện thoại hoặc mật khẩu không đúng!', 401);
        
        // Chặn nếu không phải Tài xế
        if (account.role_id !== 3) throw new ApiError('Tài khoản không có quyền truy cập App Tài xế!', 403);
        if (!account.status) throw new ApiError('Tài khoản của bạn đã bị khóa!', 403);

        const isMatch = await bcrypt.compare(data.password, account.password);
        if (!isMatch) throw new ApiError('Số điện thoại hoặc mật khẩu không đúng!', 401);

        const statusDriver = await Driver.findOne({where:{account_id: account.id}});

        const token = JwtProvider.generateToken(
            { id: account.id, role: account.role_id },
            process.env.JWT_SECRET as Secret,
            process.env.JWT_EXPIRES_IN as JwtPayload['exp']
        );

        return { token, user: { id: account.id, phone: account.phone, role: account.role_id, status: statusDriver?.status, full_name: statusDriver?.full_name, avatar: statusDriver?.avatar } };
    }
}
export default DriverAuthService;