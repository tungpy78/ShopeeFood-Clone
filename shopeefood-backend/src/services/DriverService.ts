import { sequelize } from "../config/connectDB";
import { Account, Category, Customer, Driver, Food, Merchant, Order, OrderDetail } from "../models";
import ApiError from "../utils/ErrorClass";

class DriverService{
    static async getAvailableOrders(driverId: number){
        const driver = await Driver.findOne({
            where:{ account_id: driverId}
        })
        if(!driver){
            throw new ApiError('Tài khoản tài xế không tồn tại', 404);
            
        }
        if(!driver.is_online){
            throw new ApiError('Bạn đang Offline, hãy bật Online để nhận đơn!', 400);
        }
        const order = await Order.findAll({
            where:{ status: "FINDING_DRIVER" },
            include:[
                {
                    model: Merchant,
                    as: 'merchant_info',
                    attributes: ['name', 'address', 'phone', 'latitude', 'longitude']
                },
                {
                    model: Customer,
                    as: 'customer_info',
                    attributes: ['full_name'],
                    include:[
                        {
                            model: Account,
                            as: 'account',
                            attributes: ['phone']
                        }
                    ]
                },
                {
                    model: OrderDetail,
                    as: 'items',
                    include:[
                        {
                            model: Food,
                            as: 'food_info',
                            attributes: ['name', 'description'],
                            include:[
                                {
                                    model: Category,
                                    as: 'category',
                                    attributes: ['name']
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['createdAt', 'ASC']]
        });
        return order;
    }
    // 2. TÀI XẾ NHẬN ĐƠN (CƯỚP ĐƠN)
    static async acceptOrder(driverId: number, orderId: number){
        const driver = await Driver.findOne({
            where: { account_id: driverId}
        })
        if(!driver){
            throw new ApiError('Tài xế không tồn tại', 404);
        }
        if (!driver.is_online) throw new ApiError('Bạn chưa bật Online', 400);

        const t = await sequelize.transaction(); // Dùng transaction để tránh tranh chấp đơn
        try {
            const order = await Order.findByPk(orderId, { transaction: t, lock: t.LOCK.UPDATE });
            if (!order) throw new ApiError('Đơn hàng không tồn tại', 404);
            // Kiểm tra xem đơn còn 'ngon' không hay bị người khác nhận rồi?
            if (order.status !== 'FINDING_DRIVER') {
                throw new ApiError('Chậm chân rồi! Đơn hàng này đã có người nhận hoặc đã bị hủy.', 409);
            }

            // Cập nhật thông tin: Gán driver_id và đổi status
            order.driver_id = driver.account_id;
            order.status = 'SHIPPING'; // Chuyển sang đang giao
            
            await order.save({ transaction: t });

            await t.commit();
            return order;
        } catch (error) {
            await t.rollback();
            throw new ApiError('Nhận đơn thất bại, vui lòng thử lại sau.', 500);
        }

    }

    // 3. HOÀN THÀNH ĐƠN (GIAO XONG)
    static async completeOrder(driverId: number, orderId: number) {
        const order = await Order.findOne({ 
            where: { id: orderId, driver_id: driverId, status: 'SHIPPING' } 
        });

        if (!order) throw new ApiError('Đơn hàng không hợp lệ để hoàn thành', 404);

        order.status = 'COMPLETED';
        await order.save();
        return order;
    }
}
export default DriverService;
