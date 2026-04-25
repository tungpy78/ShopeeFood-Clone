import { sequelize } from '../config/connectDB';
import { DataTypes, Model } from "sequelize";

class Order extends Model{
    declare id: number;
    declare customer_id: number;
    declare merchant_id: number;
    declare driver_id: number;
    declare total_price: number;
    declare shipping_fee: number;
    declare final_price: number;
    declare shipping_address: string;
    declare payment_method: string;
    declare status: string;

    public merchant_info?: any;
    public customer_info?: any;
}
Order.init({
    id:{
        type: DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement: true
    },
    customer_id:{
        type: DataTypes.INTEGER,
        allowNull: false
    },
    merchant_id:{
        type: DataTypes.INTEGER,
        allowNull:false
    },
    driver_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // --- NHÓM TIỀN BẠC (Theo DBML) ---
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  shipping_fee: { // Thêm trường này
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 15000 // Mặc định 15k
  },
  final_price: { // Thêm trường này
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  // ----------------------------------
  shipping_address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  payment_method: {
    type: DataTypes.ENUM('CASH', 'MOMO', 'ZALOPAY'),
    defaultValue: 'CASH'
  },
  status: {
    type: DataTypes.ENUM(
      'PENDING',
      'PREPARING',
      'FINDING_DRIVER',
      'DRIVER_PICKING',
      'DELIVERING',
      'COMPLETED',
      'CANCELLED',
    ),
    defaultValue: 'PENDING'
  }
}, {
  sequelize,
  modelName: 'Order',
  tableName: 'orders',
  timestamps: true
});
export default Order;