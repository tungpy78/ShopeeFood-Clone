import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/connectDB';

class FoodOptionGroup extends Model {
  declare food_id: number;
  declare group_id: number;
}

FoodOptionGroup.init({
  food_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  group_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  }
}, {
  sequelize,
  modelName: 'FoodOptionGroup',
  tableName: 'food_option_groups',
  timestamps: false
});

export default FoodOptionGroup;