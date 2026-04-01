import { col, fn, literal, Op } from "sequelize";
import { Account, Driver, Food, Merchant, Order, OrderDetail } from "../models";
import ApiError from "../utils/ErrorClass";

class StatisticService{
    static async getMerchantStats(accountId: number){
        const merchant = await Merchant.findOne({
            where: { account_id: accountId }
        })
        if(!merchant){
            throw new ApiError('Quán không tồn tại', 404);
        }

        // Xác định thời gian "Hôm nay" (Từ 00:00 đến 23:59)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0); // 00:00:00 của 7 ngày trước

        // Tính tổng doanh thu hôm nay (Chỉ tính đơn COMPLETED)
        const revenueToday = await Order.sum('total_price', {
            where:{
                merchant_id: merchant.account_id,
                status: 'COMPLETED',
                createdAt:{
                    [Op.between]: [startOfToday, endOfToday]
                }
            }
        }) || 0; // Nếu null thì trả về 0

        //Đếm số đơn hôm nay
        const orderToday = await Order.count({
            where:{
                merchant_id: merchant.account_id,
                status: 'COMPLETED',
                createdAt:{
                    [Op.between]: [startOfToday, endOfToday]
                }
            }
        })

        // c. Tổng đơn bị hủy hôm nay (Để chủ quán giật mình)
        const todayCancelledOrders = await Order.count({
            where: {
                merchant_id: merchant.account_id,
                status: 'CANCELLED',
                createdAt: { [Op.between]: [startOfToday, endOfToday] }
            }
        });

        //tổng doanh thu toàn thời gian (All time)

        const totalRevenue = await Order.sum('total_price', {
            where:{
                merchant_id: merchant.account_id,
                status: 'COMPLETED'
            }
        });

        // ==========================================
        // KHỐI 2: BIỂU ĐỒ DOANH THU 7 NGÀY QUA
        // ==========================================
        const revenueChart = await Order.findAll({
            attributes: [
                [fn('DATE', col('createdAt')), 'date'], // Ép kiểu DateTime về Date (YYYY-MM-DD)
                [fn('SUM', col('final_price')), 'revenue'] // Cộng dồn tiền theo ngày
            ],
            where: {
                merchant_id: merchant.account_id,
                status: 'COMPLETED',
                createdAt: { [Op.gte]: sevenDaysAgo }
            },
            group: [fn('DATE', col('createdAt'))], // Gom nhóm theo ngày
            order: [[fn('DATE', col('createdAt')), 'ASC']] // Sắp xếp từ cũ đến mới
        });

        // ==========================================
        // KHỐI 3: TOP 5 MÓN BÁN CHẠY NHẤT (ALL TIME)
        // ==========================================
        const topFoods = await OrderDetail.findAll({
            attributes: [
                'food_id',
                [fn('SUM', col('quantity')), 'total_sold'] // Cộng tổng số lượng món này đã bán
            ],
            include: [
                {
                    model: Order,
                    as: 'order', // Chú ý: Alias này phải khớp với định nghĩa ở file Model associations
                    attributes: [],
                    where: {
                        merchant_id: merchant.account_id,
                        status: 'COMPLETED' // Phải giao xong mới tính là đã bán
                    }
                },
                {
                    model: Food,
                    as: 'food_info', // Khớp với alias em đã định nghĩa
                    attributes: ['name', 'image']
                }
            ],
            group: ['food_id', 'food_info.id'],
            order: [[literal('total_sold'), 'DESC']], // Xếp từ cao xuống thấp
            limit: 5 // Chỉ lấy Top 5
        });

        return {
            kpi: {
                today_revenue: revenueToday,
                today_completed: orderToday,
                today_cancelled: todayCancelledOrders,
                total_revenue: totalRevenue || 0
            },
            chart: revenueChart,
            top_foods: topFoods
        }
    }

    static async getAdminStats(){
        // Chạy 4 câu lệnh cùng lúc cho nhanh
        const [totalMerchants, totalOrders, total_drivers,totalRevenue] = await Promise.all([
            //Đếm khách hàng (Role ID = 2)
            Account.count({ where: { role_id: 2 } }),
            // 2. Đếm quán ăn (Đang hoạt động)
            Merchant.count({ where: { status: 'ACTIVE' } }),

            // 3. Đếm tài xế (Đang hoạt động)
            Driver.count({ where: { status: 'ACTIVE' } }),

            // 4. Tổng doanh thu toàn sàn (Chỉ tính đơn đã hoàn thành)
            Order.sum('final_price', { where: { status: 'COMPLETED' } })
        ]);
        return {
            totalMerchants,
            totalOrders,
            total_drivers,
            totalRevenue: totalRevenue || 0
        };
    }

}
export default StatisticService