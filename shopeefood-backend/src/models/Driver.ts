import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/connectDB';

class Driver extends Model {
  declare account_id: number;
  declare full_name: string;
  declare vehicle_plate: string; // Biển số xe
  declare is_online: boolean;    // Đang bật app hay tắt?
  declare current_lat: number;   // Vị trí hiện tại
  declare current_long: number;
  declare wallet_balance: number;// Tiền cọc trong ví
  declare status: string;

  // --- THÊM 3 TRƯỜNG MỚI ---
  declare avatar: string;
  declare id_card: string;
  declare date_of_birth: Date;

}

Driver.init({
  account_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  // --- THÊM CỘT NÀY ---
  full_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  vehicle_plate: {
    type: DataTypes.STRING,
    allowNull: true
  },

  avatar: {
    type: DataTypes.STRING, // Lưu URL ảnh từ Cloudinary
    allowNull: true
  },
  id_card: {
    type: DataTypes.STRING(20), // CCCD thường 12 số
    allowNull: true
  },
  date_of_birth: {
    type: DataTypes.DATEONLY, // Chỉ lưu Ngày/Tháng/Năm
    allowNull: true
  },

  is_online: {
    type: DataTypes.BOOLEAN,
    defaultValue: false // Mặc định offline
  },
  current_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  current_long: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  wallet_balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'BANNED', 'PENDING_APPROVAL', 'INCOMPLETE'),
    defaultValue: 'INCOMPLETE' // 👈 Vừa tạo Account thì trạng thái là CHƯA HOÀN THÀNH
  }
}, {
  sequelize,
  modelName: 'Driver',
  tableName: 'drivers',
  timestamps: true
});

export default Driver;