import { Merchant } from "../models";
import ApiError from "../utils/ErrorClass";

class CustomerService{
    static async getMerchant(){
        const merchant = await Merchant.findAll({
            where: {status : "Active"}
        })
        if(!merchant){
            throw new ApiError("Không có quán nào", 404)
        }
        return merchant
    }
}
export default CustomerService