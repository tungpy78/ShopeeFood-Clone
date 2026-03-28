import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/connectDB';

class Option extends Model {
  declare id: number;
  declare group_id: number;
  declare name: string;
  declare price_adjustment: number; // Giá cộng thêm (Quan trọng)
}

Option.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price_adjustment: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // Mặc định không tăng giá
  }
}, {
  sequelize,
  modelName: 'Option',
  tableName: 'options',
  timestamps: false
});

export default Option;