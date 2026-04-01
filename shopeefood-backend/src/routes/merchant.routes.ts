import { Router } from 'express';
import { 
    addCategory, addFood, createMerchantProfile, createOptionGroupWithOptions, 
    deleteCategory, deleteFood, getFood, getMerchantMenu, getMerchantOrders, 
    getMyProfile, getOptionOfGroup, updateCategory, updateFood, 
    updateMerchantProfile, updateOrderStatus 
} from '../controllers/merchant/MerchantController';
import { createOption, deleteOptionGroup, updateOptionGroup } from "../controllers/merchant/OptionGroupController";
import { getMerchantStats } from '../controllers/merchant/StatisticController';
import validate from '../middlewares/validateMiddleware';
import { addCategorySchema, createFoodSchema, createMerchantSchema } from '../validations/merchantValidation';

const merchantRouter = Router();

// --- THÔNG TIN QUÁN (Profile) ---
merchantRouter.post('/profile', validate(createMerchantSchema), createMerchantProfile);
merchantRouter.get('/profile', getMyProfile);
merchantRouter.put('/profile', validate(createMerchantSchema), updateMerchantProfile);

// --- DANH MỤC (Categories) ---
merchantRouter.get('/categories', getMerchantMenu);
merchantRouter.post('/categories', validate(addCategorySchema), addCategory);
merchantRouter.put('/categories/:categoryId', validate(addCategorySchema), updateCategory);
merchantRouter.delete('/categories/:categoryId', deleteCategory);

// --- MÓN ĂN (Foods) ---
merchantRouter.get('/foods', getFood);
merchantRouter.post('/foods', validate(createFoodSchema), addFood);
merchantRouter.put('/foods/:foodId', validate(createFoodSchema), updateFood);
merchantRouter.delete('/foods/:foodId', deleteFood);

// --- TÙY CHỌN (Option Groups) ---
merchantRouter.get('/option-groups', getOptionOfGroup);
merchantRouter.post('/option-groups', createOptionGroupWithOptions);
merchantRouter.put('/option-groups/:id', updateOptionGroup);
merchantRouter.delete('/option-groups/:id', deleteOptionGroup);
merchantRouter.post('/option-groups/:groupId/options', createOption); // Thêm option nhỏ vào group

// --- QUẢN LÝ ĐƠN HÀNG (Orders) ---
merchantRouter.get('/orders', getMerchantOrders);
merchantRouter.patch('/orders/:orderId', updateOrderStatus);

// --- THỐNG KÊ (Statistics) ---
merchantRouter.get('/stats', getMerchantStats);

export default merchantRouter;