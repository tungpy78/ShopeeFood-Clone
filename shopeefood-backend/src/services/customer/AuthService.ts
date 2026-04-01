import bcrypt from 'bcryptjs';
import { JwtPayload, Secret } from 'jsonwebtoken';
import { LoginDTO, RegisterDTO } from '../../interfaces/auth.interface';
import { Account, Customer } from '../../models';
import ApiError from '../../utils/ErrorClass';
import JwtProvider from '../../providers/JwtProvider';

class CustomerAuthService {
    static async register(data: RegisterDTO) {
        // 1. Check tồn tại
        const existingAccount = await Account.findOne({ where: { phone: data.phone } });
        if (existingAccount) throw new ApiError('Số điện thoại này đã được sử dụng!', 409);

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        // 3. Tạo Account (Bắt buộc Role = 2)
        const newAccount = await Account.create({
            phone: data.phone,
            password: hashedPassword,
            role_id: 2, 
            status: true
        });

        // 4. Tạo Profile Customer
        await Customer.create({
            account_id: newAccount.id,
            full_name: data.full_name || 'Khách hàng',
            email: '',
            avatar: ''
        });

        return newAccount;
    }

    static async login(data: LoginDTO) {
        const account = await Account.findOne({ where: { phone: data.phone },
            include:[
            {
                model:Customer, 
                as:'customer_profile',
                attributes:['full_name']
            }
            ] },);
        if (!account) throw new ApiError('Số điện thoại hoặc mật khẩu không đúng!', 401);
        
        // Chặn nếu không phải Khách hàng
        if (account.role_id !== 2) throw new ApiError('Tài khoản không có quyền truy cập ứng dụng Khách hàng!', 403);
        if (!account.status) throw new ApiError('Tài khoản của bạn đã bị khóa!', 403);

        const isMatch = await bcrypt.compare(data.password, account.password);
        if (!isMatch) throw new ApiError('Số điện thoại hoặc mật khẩu không đúng!', 401);

        const token = JwtProvider.generateToken(
            { id: account.id, role: account.role_id },
            process.env.JWT_SECRET as Secret,
            process.env.JWT_EXPIRES_IN as JwtPayload['exp']
        );

        return { token, user: { id: account.id, full_name: account.customer_profile?.full_name, phone: account.phone, role: account.role_id } };
    }
}
export default CustomerAuthService;