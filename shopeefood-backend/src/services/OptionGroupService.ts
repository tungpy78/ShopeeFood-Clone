import { sequelize } from "../config/connectDB";
import { FoodOptionGroup, Merchant, Option, OptionGroup } from "../models";
import ApiError from "../utils/ErrorClass";
import MerchantService from "./MerchantService";

class OptionGroupService{
    static async createOption(merchantId: number,groupId: number, option:Option[]){

        const merchant = await Merchant.findOne({where:{account_id: merchantId}})
        if(!merchant) throw new ApiError("Quán không tồn tại", 404)

        const optionGroup = await OptionGroup.findOne({where:{id: groupId, merchant_id: merchantId}});
        if(!optionGroup){
            throw new ApiError("Không tồn tại GroupOption đó", 404)
        }

        if (!option || option.length === 0) {
           throw new ApiError("Danh sách trống", 404);

        }

        const optionToInsert = option.map(opt => ({
            group_id: groupId,
            name: opt.name,
            price_adjustment: opt.price_adjustment
        }))

        await Option.bulkCreate(optionToInsert);

        return optionToInsert;
    }

    static async updateOptionGroup(merchantId: number,id: number, name: string, is_mandatory: boolean, max_choices: number, options:Option[]){
        // Khởi tạo Transaction
    const t = await sequelize.transaction();
    try {
        // 1. Kiểm tra xem nhóm tùy chọn có tồn tại không
        const merchant = await Merchant.findOne({where:{account_id: merchantId}})
        if(!merchant) throw new ApiError("Quán không tồn tại", 404);

        const group = await OptionGroup.findByPk(id);
        if (!group) {
            await t.rollback();
            throw new ApiError("Không tìm thấy nhóm tùy chọn!", 404)
        }

        await OptionGroup.update({
            name,
            is_mandatory,
            max_choices
        },{
            where: {id: id,merchant_id: merchantId},
            transaction: t
        })

        // Bước 2: Xóa SẠCH các Option cũ thuộc group_id này
        await Option.destroy({
            where: { group_id: id },
            transaction: t
        });

        // Bước 3: Insert lại mảng options mới (giống hệt hàm Create)
        if(options && options.length > 0){
            const optionsName = options.map(opt => opt.name.trim().toLowerCase());
            
            const uniqueNames = new Set(optionsName)

            if(uniqueNames.size !== optionsName.length){
                throw new ApiError("Các option bị trùng tên", 400);
            }

            const optionsData = options.map(opt => ({
                group_id: id,
                name: opt.name,
                price_adjustment: opt.price_adjustment || 0
            }))

            await Option.bulkCreate(optionsData,{transaction:t})
        }
        // Cam kết lưu
        await t.commit();

        return true;

        
    } catch (error) {
        await t.rollback();
        console.error("Lỗi khi cập nhật nhóm tùy chọn:", error);
        throw new ApiError("Lỗi server khi cập nhật", 500)
    }
    }
    
    static async deleteOptionGroup(merchantId: number,groupId: number){
        const t = await sequelize.transaction();
        try {
            const merchant = await Merchant.findOne({where:{account_id: merchantId}})
            if(!merchant) throw new ApiError("Quán không tồn tại", 404)

            const group = await OptionGroup.findByPk(groupId);
            if (!group) {
                await t.rollback(); 
                throw new ApiError("Không tìm thấy nhóm tùy chọn!", 404)
            }

            await Option.destroy({
                where:{group_id: groupId},
                transaction: t
            })

            await FoodOptionGroup.destroy({
                where:{group_id: groupId},
                transaction: t
            })

            await OptionGroup.destroy({
                where:{id: groupId, merchant_id: merchantId},
                transaction: t
            })

            await t.commit();

            return true;

        } catch (error) {
            // Hoàn tác nếu có lỗi
            await t.rollback();
            console.error("Lỗi khi xóa nhóm tùy chọn:", error);
            throw new ApiError("Lỗi server khi xóa nhóm tùy chọn", 500)
        }
    }
    
}
export default OptionGroupService