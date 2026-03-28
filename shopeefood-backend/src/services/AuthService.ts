import bcrypt from 'bcryptjs';
import { LoginDTO, RegisterDTO } from "../interfaces/auth.interface";
import { Account, Customer, Role } from "../models";
import ApiError from "../utils/ErrorClass";
import JwtProvider from '../providers/JwtProvider';
import { JwtPayload, Secret } from 'jsonwebtoken';

class AuthService {
    // Dữ liệu đầu vào bắt buộc phải tuân theo RegisterDTO
    static async registerUser(data: RegisterDTO){
        // 1. Check tồn tại
        const existingAccount = await Account.findOne(
            {
                where:{phone: data.phone}
            }
        )
        if(existingAccount){
            throw new ApiError('Số điện thoại này đã được sử dụng!', 409);
        }
        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);
        // 3. Tạo Account
        const newAccount = await Account.create({
            phone: data.phone,
            password: hashedPassword,
            role_id: data.role_id || 2, // Mặc định role_id = 2 (Customer)
            status: true
        })
        // 4. Tạo Profile Customer
        if(newAccount.role_id == 2){
            await Customer.create({
                account_id: newAccount.id,
                full_name: data.full_name || 'Khách hàng mới',
                email: '',
                avatar: ''
            });
        }
        return newAccount;

    }
    static async loginUser(data: LoginDTO){
        // 1. Check tồn tại
        const existingAccount = await Account.findOne(
            {
                where:{phone: data.phone},
                include: [{model: Role, as: 'role'}] //lấy luôn thông tin role
            }
        );
        if(!existingAccount){
            throw new ApiError('Số điện thoại hoặc mật khẩu không đúng!', 401);
        }
        // 2. So Sánh Mật khẩu
        const isMatch = await bcrypt.compare(data.password, existingAccount.password);
        if(!isMatch){
            throw new ApiError('Số điện thoại hoặc mật khẩu không đúng!', 401);
        }

        const token = JwtProvider.generateToken(
            {
                id: existingAccount.id,
                role: existingAccount.role_id
            },
            process.env.JWT_SECRET as Secret,
            process.env.JWT_EXPIRES_IN as JwtPayload['exp']
        );
        return{
            token,
            user:{
                id: existingAccount.id,
                phone: existingAccount.phone,
                role: existingAccount.role_id
            }
        };
    }
}
export default AuthService;