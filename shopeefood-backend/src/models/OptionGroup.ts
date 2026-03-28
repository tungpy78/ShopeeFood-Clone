    import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/connectDB';

class OptionGroup extends Model {
  declare id: number;
  declare merchant_id: number;
  declare name: string;
  declare is_mandatory: boolean; // Bắt buộc chọn không?
  declare max_choices: number;   // Được chọn tối đa mấy cái?
}

OptionGroup.init({
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
  },
  is_mandatory: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  max_choices: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  sequelize,
  modelName: 'OptionGroup',
  tableName: 'option_groups',
  timestamps: false
});

export default OptionGroup;