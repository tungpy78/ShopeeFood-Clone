import { Op } from "sequelize";
import { sequelize } from "../../config/connectDB";
import { Account, Category, Customer, Driver, Food, Merchant, Order, OrderDetail } from "../../models";
import ApiError from "../../utils/ErrorClass";
import { socketService } from "../../config/socket";
import DriverTransaction from "../../models/DriverTransaction";
import moment from "moment";


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

        const isBusy = await Order.findOne({
            where: {
                driver_id: driverId,
                status: ['DRIVER_PICKING', 'DELIVERING'] // Đang giao dở dang
            }
        });

        if (isBusy) {
            throw new ApiError('Bạn đang có đơn hàng chưa hoàn thành, không thể nhận thêm!', 400);
        }

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
            order.status = 'DRIVER_PICKING'; // Chuyển sang đang giao
            
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

    static async getDriverProfile(driverId: number){
        const driver = await Driver.findOne({
            where:{ account_id: driverId },
            include:[
                {
                    model:Account,
                    as:"account",
                    attributes:["phone"]
                }
            ]
        })
        if(!driver) throw new ApiError('Không tìm thấy hồ sơ tài xế', 404);

        return driver;
    }

    // 5. BẬT / TẮT TRẠNG THÁI ONLINE
    static async toggleStatus(driverId: number, isOneline: boolean){
        const driver = await Driver.findOne({
            where:{ account_id: driverId }
        })

        if (!driver) throw new ApiError('Tài xế không tồn tại', 404);

        if (driver.status === 'PENDING_APPROVAL') {
            throw new ApiError('Tài khoản của bạn đang chờ Admin duyệt, chưa thể Online!', 403);
        }

        driver.is_online = isOneline;

        await driver.save();

        return driver;
    }

    // 6. LẤY ĐƠN HÀNG ĐANG GIAO HIỆN TẠI (ĐỂ KHÔNG BỊ MẤT KHI THOÁT APP)
    static async getActiveOrder(driverId: number){
        const activeOrder = await Order.findOne({
            where:{
                driver_id: driverId,
                status: { [Op.in]: ['DRIVER_PICKING', 'DELIVERING'] } // Tìm đơn đang đi lấy hoặc đang giao
            },
            include:[
                {
                    model: Merchant,
                    as:"merchant_info",
                    attributes:['name', 'address', 'phone', 'latitude', 'longitude']
                },
                {
                    model: Customer,
                    as: 'customer_info',
                    attributes:['full_name'],
                    include: [{ model: Account, as: 'account', attributes: ['phone'] }]
                },
                {
                    model: OrderDetail,
                    as: 'items',
                    include: [{ model: Food, as: 'food_info', attributes: ['name', 'image'] }]
                }
            ]
        });
        return activeOrder;
    }

    // 5. THỐNG KÊ THU NHẬP CỦA TÀI XẾ
    static async getRevenueChart(driverId: number) {
        const driver = await Driver.findOne({where: { account_id: driverId }});
        if(!driver) throw new ApiError("Không tìm thấy tài xế",404);

        const chartData = [];
        for(let i = 6; i>=0; i--){
            const targetDate = moment().subtract(i, 'days');

            const startOfDate = targetDate.startOf('day').toDate();
            const endOfDate = targetDate.endOf('day').toDate();

            const dailyRevenue = await Order.sum('shipping_fee', {
                where:{
                    driver_id: driverId,
                    status: "COMPLETED",
                    createdAt: {[Op.between]: [startOfDate, endOfDate]}
                }
            }) || 0;

            let dayLable = targetDate.format('DD/MM');
            let dayName = "";
            const dayOfWeek = targetDate.day();
            if(dayOfWeek === 0) dayName = "CN";
            else dayName = `T${dayOfWeek + 1}`;

            chartData.push({
                label: `${dayLable}\n${dayName}`,
                revenue: Number(dailyRevenue)
            });
        }

        const totalWeekRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);

        return{
            total_revenue: totalWeekRevenue,
            chart_data: chartData
        };

    }

    static async setupProfile(driverId: number, data: { 
        full_name: string, 
        vehicle_plate: string,
        avatar: string,
        id_card: string,
        date_of_birth: string // Frontend gửi lên chuỗi YYYY-MM-DD
    }) {
        const driver = await Driver.findOne({ where: { account_id: driverId } });
        if (!driver) throw new ApiError('Tài xế không tồn tại', 404);

        // Cập nhật toàn bộ thông tin
        driver.full_name = data.full_name;
        driver.vehicle_plate = data.vehicle_plate;
        driver.avatar = data.avatar;
        driver.id_card = data.id_card;
        driver.date_of_birth = new Date(data.date_of_birth) as any;
        
        // Chuyển trạng thái sang Chờ Duyệt
        driver.status = 'PENDING_APPROVAL'; 

        await driver.save();
        return driver;
    }

    static async updateOrderStatus(accountId: number, orderId: number, newStatus: string) {
        // 1. Tìm thông tin tài xế
        const driver = await Driver.findOne({ where: { account_id: accountId } });
        if (!driver) {
            throw new ApiError('Tài xế không tồn tại', 404);
        }

        // 2. Tìm đơn hàng (BẮT BUỘC phải check driver_id để đảm bảo tài xế không sửa bậy đơn của người khác)
        const order = await Order.findOne({
            where: {
                id: orderId,
                driver_id: driver.account_id
            }
        });

        if (!order) {
            throw new ApiError('Đơn hàng không tồn tại hoặc bạn không có quyền cập nhật đơn này', 404);
        }

        // 3. LOGIC CHẶN TRẠNG THÁI DÀNH RIÊNG CHO TÀI XẾ
        const validTransitions: any = {
            'DRIVER_PICKING': ['DELIVERING'], // Đã lấy món xong -> Đi giao
            'DELIVERING': ['COMPLETED']       // Đi giao tới nơi -> Hoàn thành
        };

        const allowedNextStates = validTransitions[order.status];

        if (!allowedNextStates || !allowedNextStates.includes(newStatus)) {
            throw new ApiError(`Tài xế không thể chuyển từ '${order.status}' sang '${newStatus}'`, 400);
        }

        if(newStatus === 'COMPLETED'){
            const t = await sequelize.transaction();

            try {
                order.status = 'COMPLETED';
                await order.save({transaction: t});

                const currentDriver = await Driver.findOne({
                    where:{account_id: accountId},
                    transaction :t, lock: t.LOCK.UPDATE
                });

                if (!currentDriver) {
                    throw new ApiError("Lỗi dữ liệu: Không tìm thấy ví tài xế!", 404);
                }
                

                if(order.payment_method === 'CASH'){
                    const amountToDeduct = Number(order.total_price);

                    currentDriver.wallet_balance = Number(currentDriver?.wallet_balance) - amountToDeduct;
                    await currentDriver?.save({transaction: t});

                    await DriverTransaction.create({
                        driver_id: currentDriver?.account_id,
                        amount: -amountToDeduct,
                        type: 'CASH_ORDER',
                        description: `Trừ tiền thu hộ đơn #${order.id}`
                    }, {transaction: t});
                }else{
                    const amountToAdd = Number(order.shipping_fee);

                    currentDriver.wallet_balance = Number(currentDriver?.wallet_balance) + amountToAdd;

                    await DriverTransaction.create({
                        driver_id: currentDriver?.account_id,
                        amount: amountToAdd,
                        type: 'ONLINE_ORDER',
                        description: `Cộng phí giao hàng đơn #${order.id}`
                    }, {transaction: t});
                }

                await t.commit();

            } catch (error) {
                await t.rollback(); // Lỗi thì hoàn tác, không ai mất tiền
                throw new ApiError("Lỗi hệ thống khi thanh toán đơn hàng", 500);
            }
        }else {
            // Nếu chuyển sang trạng thái bình thường (PICKING, DELIVERING) thì lưu bình thường
            order.status = newStatus;
            await order.save();
        }

        try {
            const io = socketService.getIO();
            const customerRoom = `customer_${order.customer_id}`;
            
            let message = '';
            if (newStatus === 'DELIVERING') message = `🚴 Bác tài đã lấy món và đang trên đường giao đến bạn!`;
            if (newStatus === 'COMPLETED') message = `✅ Đơn hàng đã được giao thành công. Chúc bạn ngon miệng!`;

            io.to(customerRoom).emit('order_status_update', {
                message: message,
                status: newStatus,
                order: order
            });
        } catch (error) {
            console.error("Lỗi khi bắn socket Tài xế:", error);
        }

        return order;
    }

    static async getWalletInfo(driverId: number) {
        const driver = await Driver.findOne({ where: { account_id: driverId } });
        if (!driver) throw new ApiError("Không tìm thấy tài xế", 404);

        // Lấy 20 giao dịch gần nhất
        const transactions = await DriverTransaction.findAll({
            where: { driver_id: driverId },
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        return {
            balance: driver.wallet_balance,
            transactions: transactions
        };
    }

}


export default DriverService;