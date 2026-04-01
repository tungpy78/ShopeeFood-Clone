import { Request, Response, NextFunction } from 'express';
import { MerChantDTO } from "../interfaces/merchant.interface";
import MerchantService from '../services/MerchantService';
import AppResponse from '../utils/AppResponse';
import { socketService } from '../config/socket';

export const createMerchantProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
        return AppResponse.error(res, 'Không tìm thấy thông tin người dùng', 401);
        }
        const account_id = req.user.id;
        const merchantData: MerChantDTO = req.body;

        const newShop = await MerchantService.createMerchant(account_id, merchantData);

        return AppResponse.success(res, newShop, 'Tạo thông tin quán thành công!', 201);

    } catch (error) {
        next(error);
    }
}

export const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
        return AppResponse.error(res, 'Không tìm thấy thông tin người dùng', 401);
    }
    const userId = req.user.id;
    const shop = await MerchantService.getMyMerchantProfile(Number(userId));
    return AppResponse.success(res, shop, 'Lấy thông tin quán thành công!');
  } catch (error) {
    next(error);
  }
};

export const updateMerchantProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
        return AppResponse.error(res, 'Không tìm thấy thông tin người dùng', 401);
    }
    const userId = req.user.id;
    const merchantData: MerChantDTO = req.body;
    const updatedShop = await MerchantService.updateMerchantProfile(Number(userId), merchantData);
    return AppResponse.success(res, updatedShop, 'Cập nhật thông tin quán thành công!');
  } catch (error) {
    next(error);
  }
};

export const addCategory =  async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
        return AppResponse.error(res, 'Không tìm thấy thông tin người dùng', 401);
    }
    const accountId = req.user.id;
    const { name } = req.body;
    const newCategory = await MerchantService.createCategory(accountId, name);
    return AppResponse.success(res, newCategory, 'Tạo danh mục thành công!', 201);
  } catch (error) {
    next(error);
  }
}
// API: Xem danh mục
export const getMerchantMenu = async (req: Request, res: Response, next: NextFunction) => {
     try {
        if (!req.user) return AppResponse.error(res, 'Unauthorized', 401);
        const result = await MerchantService.getMenu(req.user.id);
        return AppResponse.success(res, result, 'Lấy danh mục thành công!');
     } catch (error) {
        next(error);
    }
}

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
      if (!req.user){
          return AppResponse.error(res, 'Unauthorized', 401);
      }
      const accountId = req.user.id;
      const { categoryId } = req.params;  
      const { name } = req.body;
      const result = await MerchantService.updateCategory(accountId, Number(categoryId), name);
      return AppResponse.success(res, result, 'Cập nhật danh mục thành công!');
  } catch (error) {
    next(error)
  }
}

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
      if (!req.user){
          return AppResponse.error(res, 'Unauthorized', 401);
      }
      const accountId = req.user.id;
      const { categoryId } = req.params;  
      await MerchantService.deleteCategory(accountId, Number(categoryId));
      return AppResponse.success(res, null, 'Xóa danh mục thành công!');
  } catch (error) {
    next(error)
  }
}

// API: Thêm món ăn
export const addFood = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return AppResponse.error(res, 'Unauthorized', 401);

    const result = await MerchantService.createFood(req.user.id, req.body);
    
    return AppResponse.success(res, result, 'Thêm món thành công!', 201);
  } catch (error) {
    next(error);
  }
}

export const getFood = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return AppResponse.error(res, 'Unauthorired', 401);
    const accountId = req.user.id;
    const result = await MerchantService.getFood(accountId);
    return AppResponse.success(res, result, 'Lấy danh sách món ăn thành công!');
  } catch (error) {
    next(error);
  }
}

export const updateFood = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return AppResponse.error(res, 'Unauthorired', 401);
    const accountId = req.user.id;
    const { foodId } = req.params;
    const foodData = req.body;
    const result = await MerchantService.updateFood(accountId, Number(foodId), foodData);
    return AppResponse.success(res, result, 'Cập nhật món ăn thành công!');
  } catch (error) {
    next(error);
  }
}

export const deleteFood = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return AppResponse.error(res, 'Unauthorired', 401);
    const accountId = req.user.id;
    const { foodId } = req.params;
    await MerchantService.deleteFood(accountId, Number(foodId));
    return AppResponse.success(res, null, 'Xóa món ăn thành công!');
  } catch (error) {
    next(error);
  }
}

// API Public: Lấy chi tiết quán & menu
export const getMenuDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Lấy merchantId từ đường dẫn URL (VD: /merchants/1)
        const { id } = req.params; 
        
        const result = await MerchantService.getFullMenu(Number(id));
        
        return AppResponse.success(res, result, 'Lấy menu thành công!');
    } catch (error) {
        next(error);
    }
};
// API: Lấy danh sách đơn của quán
export const getMerchantOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return AppResponse.error(res, 'Unauthorized', 401);

    // Lấy query param status (ví dụ: /orders?status=PENDING)
    const status = req.query.status as string;

    const result = await MerchantService.getOrders(req.user.id, status);
    return AppResponse.success(res, result, 'Lấy danh sách đơn hàng thành công!');
    
  } catch (error) {
    next(error);
  }
}
// API: Cập nhật trạng thái đơn
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Fix tạm lỗi TypeScript nếu req.user chưa được định nghĩa type chuẩn
        const user = req.user as any; 
        if (!user) return AppResponse.error(res, 'Unauthorized', 401);

        const { orderId } = req.params;
        const { status } = req.body; // Status mới: CONFIRMED, PREPARING...

        const result = await MerchantService.updateOrderStatus(user.id, Number(orderId), status);

        // --- BẮT ĐẦU SỬA TỪ ĐÂY ---
        // Lấy io từ socketService thay vì req.io
        try {
            const io = socketService.getIO();

            // TRƯỜNG HỢP A: Quán bấm "Tìm tài xế" -> Báo cho Tài xế
            if (status === 'FINDING_DRIVER') {
                io.to('drivers_room').emit('job_available', {
                    message: '📢 Có đơn hàng mới cần giao!',
                    order_id: result.id,
                    earnings: '15.000đ' // Ví dụ phí ship
                });
                console.log("⚡ Đã bắn tin cho hội tài xế!");
            }

            // TRƯỜNG HỢP B: Báo cho Khách hàng biết tiến độ (Dù là status nào cũng báo)
            // Khách hàng sẽ ở phòng: customer_{ID_KHÁCH}
            const customerRoom = `customer_${result.customer_id}`;
            io.to(customerRoom).emit('order_status_update', {
                message: `Đơn hàng #${result.id} đã chuyển sang: ${status}`,
                status: status,
                order: result
            });
            console.log(`Đã bắn thông báo tiến độ cho khách: ${customerRoom}`);
            
        } catch (socketError) {
            console.error("Lỗi khi gửi socket:", socketError);
        }
        // --- KẾT THÚC SỬA ---
        
        return AppResponse.success(res, result, 'Cập nhật trạng thái thành công!', 200);
    } catch (error) {
        next(error);
    }
};

export const getOptionOfGroup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return AppResponse.error(res, 'Unauthorired', 401);
    const merchant_id = req.user.id;
    const result = await MerchantService.getOptionOfGroup(Number(merchant_id));

    return AppResponse.success(res,result,"Lấy danh sách các option của món ăn thành công", 200)
  } catch (error) {
    next(error)
  }
}

export const createOptionGroupWithOptions  = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return AppResponse.error(res, 'Unauthorired', 401);
    const merchant_id = req.user.id;
    const { name, is_mandatory, max_choices, options } = req.body;

    const result = await MerchantService.createOptionGroupWithOptions(merchant_id,name,is_mandatory,max_choices,options);

    return AppResponse.success(res,result,"Thêm nhóm tùy chọn và chi tiết thành công!",201);
    
  } catch (error) {
    next(error)
  }
}

