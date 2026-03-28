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
    allowNull: false
  },
  vehicle_plate: {
    type: DataTypes.STRING,
    allowNull: false
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
    type: DataTypes.ENUM('ACTIVE', 'BANNED', 'PENDING_APPROVAL'),
    defaultValue: 'ACTIVE'
  }
}, {
  sequelize,
  modelName: 'Driver',
  tableName: 'drivers',
  timestamps: true
});

export default Driver;