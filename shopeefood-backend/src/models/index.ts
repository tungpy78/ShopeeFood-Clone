import Role from './Role';
import Account from './Account';
import Customer from './Customer';
import Merchant from './Merchant';
import Category from './Category';
import Food from './Food';
import OrderDetail from './OrderDetail';
import Order from './Order';
import FoodOptionGroup from './FoodOptionGroup';
import OptionGroup from './OptionGroup';
import Option from './Option';
import Driver from './Driver';
import DriverTransaction from './DriverTransaction';

// --- ĐỊNH NGHĨA MỐI QUAN HỆ ---

// 1. Role - Account (1 Role có nhiều Account)
Role.hasMany(Account, { foreignKey: 'role_id', as: 'accounts' });
Account.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

// 2. Account - Customer (1 Account chỉ có 1 Customer Profile)
Account.hasOne(Customer, { foreignKey: 'account_id', as: 'customer_profile' });
Customer.belongsTo(Account, { foreignKey: 'account_id', as: 'account' });

// --- MỐI QUAN HỆ MỚI ---

// 1. Account - Merchant (1-1)
Account.hasOne(Merchant, { foreignKey: 'account_id', as: 'merchant_profile' });
Merchant.belongsTo(Account, { foreignKey: 'account_id', as: 'account' });

// 2. Merchant - Category (1 Quán có nhiều Danh mục)
Merchant.hasMany(Category, { foreignKey: 'merchant_id', as: 'categories' });
Category.belongsTo(Merchant, { foreignKey: 'merchant_id', as: 'merchant' });

// 3. Category - Food (1 Danh mục có nhiều Món)
Category.hasMany(Food, { foreignKey: 'category_id', as: 'foods' });
Food.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// --- NHÓM ĐƠN HÀNG (ORDER SYSTEM) - MỚI ---

// 1. Customer - Order (Khách hàng xem lịch sử đơn)
Customer.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
Order.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer_info' });

// 2. Merchant - Order (Chủ quán xem danh sách đơn)
Merchant.hasMany(Order, { foreignKey: 'merchant_id', as: 'merchant_orders' });
Order.belongsTo(Merchant, { foreignKey: 'merchant_id', as: 'merchant_info' });

// 3. Order - OrderDetail (Một đơn có nhiều món)
Order.hasMany(OrderDetail, { foreignKey: 'order_id', as: 'items' });
OrderDetail.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// 4. Food - OrderDetail (Để biết chi tiết đó là món gì, lấy ảnh, tên món)
Food.hasMany(OrderDetail, { foreignKey: 'food_id', as: 'order_details' });
OrderDetail.belongsTo(Food, { foreignKey: 'food_id', as: 'food_info' });

// *Lưu ý: Quan hệ với Driver mình sẽ thêm sau khi tạo Model Driver

// --- QUAN HỆ TOPPING (MỚI) ---

// 1. Merchant - OptionGroup (Quán tạo ra nhóm topping)
Merchant.hasMany(OptionGroup, { foreignKey: 'merchant_id', as: 'option_groups' });
OptionGroup.belongsTo(Merchant, { foreignKey: 'merchant_id', as: 'merchant' });

// 2. OptionGroup - Option (1 nhóm có nhiều lựa chọn)
OptionGroup.hasMany(Option, { foreignKey: 'group_id', as: 'options' });
Option.belongsTo(OptionGroup, { foreignKey: 'group_id', as: 'group' });

// 3. Food - OptionGroup (Quan hệ Nhiều - Nhiều thông qua bảng phụ)
Food.belongsToMany(OptionGroup, { 
    through: FoodOptionGroup, 
    foreignKey: 'food_id',
    as: 'option_groups' 
});
OptionGroup.belongsToMany(Food, { 
    through: FoodOptionGroup, 
    foreignKey: 'group_id',
    as: 'foods' 
});

// --- QUAN HỆ TÀI XẾ---

// 1. Account - Driver (1-1)
Account.hasOne(Driver, { foreignKey: 'account_id', as: 'driver_profile' });
Driver.belongsTo(Account, { foreignKey: 'account_id', as: 'account' });

// 2. Driver - Order (Một tài xế giao nhiều đơn)
Driver.hasMany(Order, { foreignKey: 'driver_id', as: 'shipped_orders' });
Order.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver_info' });

Driver.hasMany(DriverTransaction, { foreignKey: 'driver_id' });

// Xuất ra để dùng ở chỗ khác
export { Role, Account, Customer, Merchant, Category, Food, Order, OrderDetail, FoodOptionGroup, OptionGroup, Option, Driver };