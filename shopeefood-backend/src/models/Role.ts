import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/connectDB';

class Role extends Model {
  declare id: number;
  declare name: string;
}

Role.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Role',
  tableName: 'roles', // Tên bảng trong MySQL
  timestamps: false   // Bảng này không cần created_at
});

export default Role;