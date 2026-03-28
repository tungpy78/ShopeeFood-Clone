import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/connectDB';

class Customer extends Model {
  declare account_id: number;
  declare full_name: string;
  declare email: string;
  declare avatar: string;
}

Customer.init({
  account_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    // Lưu ý: Không để autoIncrement vì nó dùng chung ID với Account
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Customer',
  tableName: 'customers',
  timestamps: false
});

export default Customer;