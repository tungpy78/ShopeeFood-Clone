import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/connectDB';
import Customer from './Customer';

class Account extends Model {
  declare id: number;
  declare phone: string;
  declare password: string;
  declare role_id: number;
  declare status: boolean;

  declare customer_profile?: Customer;
}

Account.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    // unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Account',
  tableName: 'accounts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false, // Trong DBML mình không thiết kế updatedAt

  // ✅ THÊM ĐOẠN NÀY VÀO CUỐI (Fix lỗi Too many keys)
  indexes: [
    {
      unique: true,
      fields: ['phone'],
      name: 'unique_phone_idx' // <-- Đặt tên cứng cho nó
    }
  ]
});


export default Account;