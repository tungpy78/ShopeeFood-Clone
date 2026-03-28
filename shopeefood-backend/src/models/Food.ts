import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/connectDB';

class Food extends Model {
  declare id: number;
  declare category_id: number;
  declare name: string;
  declare description: string;
  declare price: number;
  declare image: string;
  declare is_available: boolean;
}

Food.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.INTEGER, // Tiền Việt Nam dùng Integer là chuẩn
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'Food',
  tableName: 'foods',
  timestamps: false
});

export default Food;