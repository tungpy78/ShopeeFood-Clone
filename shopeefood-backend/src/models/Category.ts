import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/connectDB';

class Category extends Model {
  declare id: number;
  declare merchant_id: number;
  declare name: string;
}

Category.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  merchant_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Category',
  tableName: 'categories',
  timestamps: false
});

export default Category;