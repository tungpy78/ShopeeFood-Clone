import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/connectDB';

class Merchant extends Model {
  declare account_id: number;
  declare name: string;
  declare address: string;
  declare phone: string;
  declare latitude: number;
  declare longitude: number;
  declare open_time: string;
  declare close_time: string;
  declare cover_image: string;
  declare status: string;
}

Merchant.init({
  account_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    // Không để autoIncrement vì nó dùng chung ID với Account
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  open_time: {
    type: DataTypes.TIME, // Kiểu dữ liệu giờ
    allowNull: true
  },
  close_time: {
    type: DataTypes.TIME,
    allowNull: true
  },
  cover_image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING_APPROVAL', 'ACTIVE', 'BANNED', 'CLOSED_TEMP'),
    defaultValue: 'PENDING_APPROVAL'
  }
}, {
  sequelize,
  modelName: 'Merchant',
  tableName: 'merchants',
  timestamps: false // Bảng này không cần created_at nếu không muốn
});

export default Merchant;