import { or } from "sequelize";
import { FoodDTO } from "../../interfaces/food.interface";
import { MerChantDTO } from "../../interfaces/merchant.interface";
import { Account, Category, Customer, Food, FoodOptionGroup, Merchant, Option, OptionGroup, Order, OrderDetail } from "../../models";
import ApiError from "../../utils/ErrorClass";
import { sequelize } from "../../config/connectDB";
import { socketService } from "../../config/socket";

class MerchantService{
    static async createMerchant(accountId: number, data: MerChantDTO){
        // 1. Kiểm tra quán đã tạo quán chưa?
        const existingMerchant = await Merchant.findOne(
            {
                where: { account_id: accountId }
            }
        )
        if(existingMerchant){
            throw new ApiError('Tài khoản này đã đăng ký thông tin quán rồi!', 400);
        }
        // 2. Tạo quán mới
        const newMerchant = await Merchant.create({
            account_id: accountId,
            name: data.name,
            address: data.address,
            phone: data.phone,
            latitude: data.latitude,
            longitude: data.longitude,
            open_time:data.open_time,
            close_time: data.close_time,
            cover_image: data.cover_image,
        });

        return newMerchant;
    }
    // Hàm lấy thông tin quán của chính mình
    static async getMyMerchantProfile(accountId: number){
        const merchant = await Merchant.findOne({
            where: { account_id: accountId }
        });
        if(!merchant){
            throw new ApiError('Bạn chưa cập nhật thông tin quán!', 404);
        }
        return merchant;
    }
    static async updateMerchantProfile(accountId: number, data: MerChantDTO){
        const merchant = await Merchant.findOne({
            where: { account_id: accountId }
        })
        if(!merchant){
            throw new ApiError('Bạn chưa cập nhật thông tin quán!', 404);
        }
        await merchant.update(data);
        return merchant;
    };
    // TẠO DANH MỤC
    static async createCategory(accountId: number, name: string){
        // 1. Kiem tra quan nguoi dung
        const merchant = await Merchant.findOne(
            {
                where: {account_id: accountId}
            }
        )
        if(!merchant){
            throw new ApiError('Bạn chưa có quán ăn nào!', 400);
        }
        // 2. Tao Danh Muc Moi
        const newCategory = await Category.create({
            merchant_id: merchant.account_id,
            name: name
        });
        return newCategory;
    }
    // LẤY DANH SÁCH CATEGORY CỦA QUÁN
    static async getMenu(accountId: number){
        const merchant = await Merchant.findOne({
            where: { account_id: accountId }
        });
        if(!merchant){
            throw new ApiError('Quán không tồn tại', 404);
        }
        const categories = await Category.findAll({
             where: { merchant_id: merchant.account_id }
        });
        return categories;
    }

    static async updateCategory(accountId: number, categoryId: number, name: string){
        const merchant = await Merchant.findOne({
            where: { account_id: accountId}
        })
        if(!merchant){
            throw new ApiError('Quán không tồn tại', 404);
        }
        const category = await Category.findOne({
            where: { id: categoryId, merchant_id: merchant.account_id }
        });
        if(!category){
            throw new ApiError('Danh mục không tồn tại hoặc không thuộc quán của bạn!', 404);
        }
        category.name = name;
        await category.save();
        return category;
    }

    static async deleteCategory(accountId: number, categoryId: number){
        const t = await sequelize.transaction();

        try {
            const merchant = await Merchant.findOne({
                where: { account_id: accountId }
            });

            if(!merchant){
                throw new ApiError('Quán không tồn tại', 404);
            }

            const category = await Category.findOne({
                where: { id: categoryId, merchant_id: merchant.account_id }
            });

            if(!category){
                throw new ApiError('Danh mục không tồn tại hoặc không thuộc quán của bạn!', 404);
            }

            const foodCount = await Food.count({ 
                where: { category_id: categoryId },
                transaction: t
            });

            if (foodCount > 0) {
                throw new ApiError('Không thể xóa danh mục này vì vẫn còn món ăn!', 400);
            }

            await category.destroy({ transaction: t });

            await t.commit();

            return true;

        } catch (error) {

            await t.rollback();

            if(error instanceof ApiError){
                throw error;
            }

            throw new ApiError('Lỗi server khi xóa danh mục', 500);
        }
    }

    //THÊM MÓN ĂN
    static async createFood(accountId: number, data: FoodDTO){

        const t = await sequelize.transaction();

        try {
            // 1.kiem tra quan
        const merchant = await Merchant.findOne({
            where: { account_id: accountId }
        })
        if(!merchant){
            throw new ApiError('Quán không tồn tại', 404);
        }
        // 2. kiem tra danh muc
        const category = await Category.findOne({
            where: {
                id: data.category_id,
                merchant_id: merchant.account_id
            }
        });
        if(!category){
            throw new ApiError('Danh mục không tồn tại hoặc không thuộc quán của bạn!', 403);
        }
        // 3. tao mon an moi
        const newFood = await Food.create({
            ...data,
        },{transaction: t});

        // 3. Xử lý lưu mảng Tùy chọn vào bảng trung gian Food_OptionGroups
        if(data.option_groups && data.option_groups.length > 0){
            const foodOptionGroupsData= data.option_groups.map(groupId => ({
                food_id: newFood.id,
                group_id: groupId
            }))

            await FoodOptionGroup.bulkCreate(foodOptionGroupsData, { transaction: t });
        }

        await t.commit();


        return newFood;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
    // Lấy danh sách món ăn của quán
    static async getFood(accountId: number){
        const merchant = await Merchant.findOne({
            where: { account_id: accountId }
        });
        if(!merchant){
            throw new ApiError('Quán không tồn tại', 404);
        }
        const foods = await Food.findAll({
            include: [
            {
                model: Category,
                as: 'category',
                attributes: [],
                where: { merchant_id: merchant.account_id }
            },
            {
                model: OptionGroup,
                as: "option_groups",
                attributes:['id','merchant_id','name','max_choices','is_mandatory'],
                through:{attributes:[]},
                include:[
                    {
                        model:Option,
                        as:"options",
                        attributes:['id','name','group_id','price_adjustment']
                    }
                ]
            }
        ]
        });
        if(!foods){
            throw new ApiError('Không tìm thấy món ăn nào thuộc quán của bạn!', 404);
        }
        return foods;
    }

    // CẬP NHẬT MÓN ĂN
    static async updateFood(accountId: number, foodId: number, data: FoodDTO){
        const t = await sequelize.transaction();

        try {
            const merchant = await Merchant.findOne({
                where: { account_id: accountId }
            });
            if(!merchant){
                throw new ApiError('Quán không tồn tại', 404);
            }
            const food = await Food.findOne({
                where: { id: foodId },
                include: [{
                    model: Category,
                    as: 'category',
                    attributes: [],
                    where: { merchant_id: merchant.account_id }
                }],
                transaction: t
            });

            if(!food){
                throw new ApiError('Món ăn không tồn tại', 404);
            }
            
            // 3. update thông tin món ăn
            const { option_groups, ...foodData } = data;

            await food.update(foodData, {
                transaction: t
            });

            // 4. xóa toàn bộ option group cũ
            await FoodOptionGroup.destroy({
                where: { food_id: foodId },
                transaction: t
            });
            // 5. thêm lại option group mới
            if (data.option_groups && data.option_groups.length > 0) {

                const foodOptionGroupsData = data.option_groups.map(groupId => ({
                    food_id: foodId,
                    group_id: groupId
                }));

                await FoodOptionGroup.bulkCreate(foodOptionGroupsData, {
                    transaction: t
                });
            }

            await t.commit();

            return food;
        } catch (error) {
            await t.rollback();
            throw error;
        }
        
    }
    // Xóa món ăn
    static async deleteFood(accountId: number, foodId: number){
    const t = await sequelize.transaction();

    try {
        const merchant = await Merchant.findOne({
            where: { account_id: accountId }
        });

        if(!merchant){
            throw new ApiError('Quán không tồn tại', 404);
        }

        const food = await Food.findOne({
            where: { id: foodId },
            include: [{
                model: Category,
                as: 'category',
                attributes: [],
                where: { merchant_id: merchant.account_id }
            }],
            transaction: t
        });

        if(!food){
            throw new ApiError('Món ăn không tồn tại', 404);
        }

        // 1. xóa option groups
        await FoodOptionGroup.destroy({
            where: { food_id: foodId },
            transaction: t
        });

        // 2. xóa food
        await food.destroy({ transaction: t });

        await t.commit();

        return;

    } catch (error) {
        await t.rollback();
        throw error;
    }
    }

    // LẤY MENU ĐẦY ĐỦ CHO KHÁCH HÀNG
    static async getFullMenu(merchantId: number){
        const fullMenu = await Merchant.findOne({
            where: { account_id: merchantId},
            include:[
                {
                    model: Category,
                    as: 'categories',
                    include:[
                        {
                            model: Food,
                            as: 'foods',
                            where: { is_available: true },
                            required:false,
                            include: [
                                {
                                    model: Category,
                                    as: 'category',
                                    attributes: [],
                                    where: { merchant_id: merchantId }
                                },
                                {
                                    model: OptionGroup,
                                    as: "option_groups",
                                    attributes:['id','merchant_id','name','max_choices','is_mandatory'],
                                    through:{attributes:[]},
                                    include:[
                                        {
                                            model:Option,
                                            as:"options",
                                            attributes:['id','name','group_id','price_adjustment']
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        })
        if(!fullMenu){
            throw new ApiError('Quán không tồn tại!', 404);
        }
        return fullMenu;
    }
    // --- LẤY DANH SÁCH ĐƠN HÀNG CỦA QUÁN ---
    static async getOrders(merchantId: number, status?: string){
        const merchant = await Merchant.findOne({
            where: {account_id: merchantId}
        })
        if(!merchant){
            throw new ApiError('Quán không tồn tại', 404);
        }
        const whereCondition: any = { merchant_id: merchant.account_id };
        // --- VALIDATE STATUS ---
        if (status) {
            // 1. Danh sách các trạng thái hợp lệ
            const validStatuses = [
                'PENDING', 
                'PREPARING', 
                'FINDING_DRIVER', 
                'DRIVER_PICKING', 
                'DELIVERING', 
                'COMPLETED', 
                'CANCELLED'
            ];
            
            // 2. Nếu status gửi lên KHÔNG nằm trong danh sách -> BÁO LỖI NGAY
            if (!validStatuses.includes(status)) {
                throw new ApiError(`Trạng thái '${status}' không hợp lệ!`, 400);
            }

            // 3. Nếu hợp lệ thì mới gán vào điều kiện tìm kiếm
            whereCondition.status = status;
        }
        const orders = await Order.findAll({
            where: whereCondition,
            include:[
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
                            attributes: ['name', 'image']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return orders;
    }
    // CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
    static async updateOrderStatus(merchantId: number, orderId: number, newStatus: string){
        const merchant = await Merchant.findOne({
            where: { account_id: merchantId }
        });
        if(!merchant){
            throw new ApiError('Quán không tồn tại', 404);
        }
        const order = await Order.findOne({
            where:{
                id: orderId,
                merchant_id: merchant.account_id
            },
            include:[
                {
                    model: Merchant,
                    as: 'merchant_info',
                    attributes:["name", "address"]
                },
                {
                    model: Customer,
                    as: 'customer_info',
                    attributes:["full_name"]
                }
            ]
        })
        if(!order){
            throw new ApiError('Đơn hàng không tồn tại hoặc không thuộc quán của bạn', 404);
        }

        const orderData = order.get({ plain: true });

        // --- 3. LOGIC CHẶN TRẠNG THÁI (STATE MACHINE) ---
        
        // Định nghĩa bản đồ: [Trạng thái hiện tại]: [Các trạng thái được phép nhảy tới]
        const validTransitions: any = {
            'PENDING': ['PREPARING', 'CANCELLED'],     // Mới vào: Nhận làm món HOẶC Hủy
            'PREPARING': ['FINDING_DRIVER'],           // Làm xong: Bấm tìm tài xế
            'FINDING_DRIVER': ['DRIVER_PICKING', 'CANCELLED'], // Hệ thống tìm: Có tài xế nhận HOẶC Không có ai (Hủy)
            'DRIVER_PICKING': ['DELIVERING', 'CANCELLED'],     // Tài xế đến: Lấy món đi giao HOẶC Tài xế bom đơn
            'DELIVERING': ['COMPLETED', 'CANCELLED'],          // Đang giao: Giao xong HOẶC Khách bom đơn
            'COMPLETED': [],                                   // End game
            'CANCELLED': []                                    // End game
        };

        // Lấy danh sách trạng thái được phép đi tiếp từ trạng thái hiện tại
        const allowedNextStates = validTransitions[order.status];

        // Kiểm tra: Nếu newStatus không nằm trong danh sách cho phép -> BÁO LỖI
        if (!allowedNextStates || !allowedNextStates.includes(newStatus)) {
            throw new ApiError(
                `Logic lỗi: Không thể chuyển từ trạng thái '${order.status}' sang '${newStatus}'`, 
                400
            );
        }

        // ------------------------------------------------

        // 4. Nếu hợp lệ thì cập nhật
        order.status = newStatus;
        await order.save();

        // 5. BẮN SOCKET THÔNG BÁO TẠI ĐÂY (Sau khi lưu DB thành công)
        try {
            const io = socketService.getIO();

            // TRƯỜNG HỢP A: Báo cho Tài xế
            if (newStatus === 'FINDING_DRIVER') {
                io.to('drivers_room').emit('job_available', {
                    message: '📢 Có đơn hàng mới cần giao!',
                    id: order.id, 
                    merchant_info: { 
                        name: orderData.merchant_info?.name, 
                        address: orderData.merchant_info?.address
                    },
                    customer_info: { 
                        name: orderData.customer_info?.full_name, 
                        address: orderData.shipping_address
                    },
                    earnings: '15.000đ'
                });
                console.log("⚡ Đã bắn tin cho hội tài xế!");
            }

            // TRƯỜNG HỢP B: Báo cho Khách hàng
            const customerRoom = `customer_${order.customer_id}`;
            io.to(customerRoom).emit('order_status_update', {
                message: `Đơn hàng #${order.id} đã chuyển sang: ${newStatus}`,
                status: newStatus,
                order: order
            });
            console.log(`Đã bắn thông báo tiến độ cho khách: ${customerRoom}`);
            
        } catch (socketError) {
            // Lỗi socket thì log ra thôi, không throw lỗi để tránh hỏng cả transaction chính
            console.error("Lỗi khi gửi socket trong Service:", socketError);
        }

        return order;
    }
    

    static async getOptionOfGroup(merchantId: Number){
        const merchant = await Merchant.findOne({where:{account_id: merchantId}})
        if(!merchant){
            throw new ApiError("Quán không tồn tại", 404);
        }

        const optionGroups = await OptionGroup.findAll({
            where:{merchant_id: merchantId},
            include:[
                {
                    model: Option,
                    as: "options",
                    attributes:['id', 'name', 'price_adjustment']
                }
            ]
        })
        
        return optionGroups;
    }
    static async createOptionGroupWithOptions(merchantId: number,name: string,is_mandatory:boolean,max_choices:number,options:Option[]){
        // Khởi tạo Transaction
        const t = await sequelize.transaction();
        try {
            const merchant = await Merchant.findOne({where:{account_id: merchantId}})
        if(!merchant) throw new ApiError("Quán không tồn tại", 404);

        const existedGroup = await OptionGroup.findOne({
            where: {
                merchant_id: merchantId,
                name: name.trim()
            },
            transaction: t
        });

        if (existedGroup) {
        throw new ApiError("Nhóm tùy chọn đã tồn tại", 400);
        }

        const newGroup = await OptionGroup.create({
            merchant_id:merchantId,
            name,
            is_mandatory,
            max_choices
        },{transaction:t})

        if(options && options.length > 0){
            const optionsName = options.map(opt => opt.name.trim().toLowerCase());

            const uniqueNames = new Set(optionsName)

            if(uniqueNames.size !== optionsName.length){
                throw new ApiError("Các option bị trùng tên", 400);
            }

            const optionsData = options.map(opt => ({
                group_id: newGroup.id,
                name: opt.name,
                price_adjustment: opt.price_adjustment || 0
            }));

            // Insert hàng loạt vào bảng Options
            await Option.bulkCreate(optionsData, { transaction: t });
        }

        // Cam kết lưu vào DB
        await t.commit();

        return newGroup;

        } catch (error) {
            await t.rollback();
            console.error("Lỗi khi tạo nhóm tùy chọn:", error);
            throw new ApiError("Lỗi server khi tạo nhóm tùy chọn",500)
        }
    }

   


}

export default MerchantService;