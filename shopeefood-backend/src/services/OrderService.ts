    import { Model } from "sequelize";
    import { OrderDTO } from "../interfaces/order.interface";
    import { Category, Food, Merchant, Option, OptionGroup, Order, OrderDetail } from "../models";
    import ApiError from "../utils/ErrorClass";
    import { OptionDTO } from "../interfaces/option.interface";
import { sequelize } from "../config/connectDB";


    class OrderService {

        static async createOrder(customerId: number, data: OrderDTO){
            // 1. Kiem tra merchant co ton tai khong
            const merchant = await Merchant.findByPk(data.merchant_id);
            if(!merchant){
                throw new ApiError('Quán ăn không tồn tại', 404);
            }
            // 2. Tinh toan gia tien
            let totalFoodPrice = 0;
            const orderItemsPlayload = [];

            // duyet qua tung mon de tinh tien
            for(const items of data.items){
                const food = await Food.findOne({
                    where:{id: items.food_id},
                    include: [{
                        model: Category,
                        as: 'category',
                        where: { merchant_id: data.merchant_id }
                    }]
                });
                if(!food){
                    throw new ApiError(`Món ăn ID ${items.food_id} không tồn tại!`, 404);
                }

                let price = Number(food.price);
                const selectedOptionsSnapshot = [];// Để lưu tên option vào JSON (Snapshot)

                // 3. TÍNH TIỀN TOPPING (NẾU CÓ)
                // Client gửi lên mảng ID: item.option_ids = [1, 2]
                if(items.option_ids && items.option_ids.length >0){
                    const options = await Option.findAll({
                        where:{id: items.option_ids},
                        include:[
                            {
                                model: OptionGroup,
                                as: 'group',

                            }
                        ]
                    }) as OptionDTO[];

                    // --- BẮT ĐẦU VALIDATE ---
                    const groupCountMap = new Map<number, number>(); // Map để đếm: { groupId: số lượng }

                    for(const opt of options){
                        // Ép kiểu để lấy thông tin group từ include
                        const group = (opt as any).group;
                        if(group){
                            // 1. Đếm số lượng option đã chọn trong group này
                            const currentCount = (groupCountMap.get(group.id) || 0) + 1;
                            groupCountMap.set(group.id, currentCount);

                            // 2. Kiểm tra quy tắc Max Choices
                            // Nếu số lượng chọn > max_choices của nhóm đó -> BÁO LỖI
                            if (currentCount > group.max_choices) {
                                throw new ApiError(
                                    `Nhóm '${group.name}' chỉ được chọn tối đa ${group.max_choices} lựa chọn!`, 
                                    400
                                );
                            }
                        }

                        

                        // Cộng giá option vào price
                        price += Number(opt.price_adjustment);
                        
                        // Lưu lại tên để hiển thị lịch sử (VD: Size L)
                        selectedOptionsSnapshot.push({
                            name: opt.name,
                            price: opt.price_adjustment
                        });

                    }
                }

                const subTotal = price * items.quantity;
                totalFoodPrice += subTotal;

                // Tao payload cho OrderDetail
                orderItemsPlayload.push({
                    food_id: items.food_id,
                    quantity: items.quantity,
                    food_name: food.name,     // <-- THÊM MỚI: Chụp lại tên món ăn
                    food_image: food.image,   // <-- THÊM MỚI: Chụp lại ảnh món ăn
                    price: price,
                    options: selectedOptionsSnapshot
                });
                
            }

            const shippingFee = 15000; // Tạm tính cố định 15k (Sau này tính theo km sau)
            const finalPrice = totalFoodPrice + shippingFee;

            // 3. Transaction de tao order va order details

            const t = await sequelize.transaction();

            try {
                const newOrder = await Order.create({
                    customer_id: customerId,
                    merchant_id: data.merchant_id,
                    total_price: totalFoodPrice,
                    shipping_fee: shippingFee,
                    final_price: finalPrice,
                    shipping_address: data.shipping_address,
                    payment_method: data.payment_method,
                    status: 'PENDING'
                }, { transaction: t });

                // Tao order details
                const detailsWithOrderId = orderItemsPlayload.map(item => ({
                    ...item,
                    order_id: newOrder.id
                }))

                await OrderDetail.bulkCreate(detailsWithOrderId, { transaction: t });

                
                await t?.commit();

                return newOrder;


            } catch (error) {
                // Nếu có lỗi -> Rollback (Hủy toàn bộ thay đổi nãy giờ)
                await t?.rollback();
                throw error;
            }

        }

        static async getOrderHistory(customerId: number){
            const orders = await Order.findAll({
                where:{customer_id: customerId},
                include:[
                    {
                        model: Merchant,
                        as: 'merchant_info',
                        attributes: ['account_id', 'name', 'address', 'phone', 'cover_image']
                    },
                    {
                        model: OrderDetail,
                        as: 'items',
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            return orders;

        }
        

    }
    export default OrderService;