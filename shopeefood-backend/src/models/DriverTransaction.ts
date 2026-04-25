import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/connectDB";

class DriverTransaction extends Model{
    declare id: number;
    declare driver_id: number;
    declare amount: number; // Số tiền (+ hoặc -)
    declare type: string;   // Mã giao dịch (CASH_ORDER, ONLINE_ORDER, DEPOSIT, WITHDRAW)
    declare description: string;
    declare createdAt: string;
    declare updatedAt: string;
}

DriverTransaction.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    driver_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    type: { 
        type: DataTypes.ENUM('CASH_ORDER', 'ONLINE_ORDER', 'DEPOSIT', 'WITHDRAW'), 
        allowNull: false 
    },
    description: { type: DataTypes.STRING, allowNull: true }
}, {
    sequelize,
    modelName: 'DriverTransaction',
    tableName: 'driver_transactions',
    timestamps: true // Tự động tạo createdAt để biết giờ giao dịch
})

export default DriverTransaction;