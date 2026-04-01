import { Merchant } from "../../models";
import ApiError from "../../utils/ErrorClass";


class AdminService{
    static async getPendingMerchants(){
        const merchant = await Merchant.findAll({
            where: { status: 'PENDING_APPROVAL'},
        })
        if(!merchant){
            throw new ApiError('No pending merchants found', 404);
        }
        return merchant;
    }
    static async approveMerchant(merchantId: number){
        const merchant = await Merchant.findByPk(merchantId);
        if(!merchant){
            throw new ApiError('Quán không tồn tại', 404);
        }
        merchant.status = 'ACTIVE';

        await merchant.save();
        return merchant;
    }
}
export default AdminService;