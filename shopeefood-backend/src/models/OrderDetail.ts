import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/connectDB';

class OrderDetail extends Model {
  declare id: number;
  declare order_id: number;
  declare food_id: number;
  declare food_name: string; // <-- THÊM MỚI: Tên món ăn lúc đặt
  declare food_image: string; // <-- THÊM MỚI: Ảnh món ăn lúc đặt
  declare quantity: number;
  declare price: number;
  declare options: object; // Lưu topping dạng JSON (Đường, Đá, Trân châu...)
}

OrderDetail.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  food_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  food_name: {
    type: DataTypes.STRING,
    allowNull: false, // Bắt buộc phải lưu tên món
  },
  food_image: {
    type: DataTypes.STRING,
    allowNull: true, // Ảnh có thể null (lỡ quán chưa up ảnh)
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  // --- QUAN TRỌNG: KHỚP VỚI DBML (options_selected json) ---
  options: {
    type: DataTypes.JSON, // MySQL hỗ trợ lưu JSON trực tiếp
    allowNull: true,
    defaultValue: {} 
    // Ví dụ lưu: { "size": "L", "sugar": "50%", "topping": ["Trân châu trắng"] }
  }
}, {
  sequelize,
  modelName: 'OrderDetail',
  tableName: 'order_details', // DBML là OrderItems, mình dùng tên này cho chuẩn Backend
  timestamps: false
});

export default OrderDetail;