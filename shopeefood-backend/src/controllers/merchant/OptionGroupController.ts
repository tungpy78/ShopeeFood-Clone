import { Request, Response, NextFunction } from 'express';
import OptionGroupService from "../../services/merchant/OptionGroupService";
import AppResponse from "../../utils/AppResponse";

export const createOption = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return AppResponse.error(res, 'Unauthorired', 401);
        const merchant_id = req.user.id;

        const {groupId} = req.params;
        const {option} = req.body;

        const result = await OptionGroupService.createOption(merchant_id,Number(groupId), option);

        return AppResponse.success(res,result,"Thêm Lựa Chọn Chi Tiết (Options) vào Nhóm thành công", 201);

    } catch (error) {
        next(error)
    }
}

export const updateOptionGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params; // Đây là ID của OptionGroup
        const { name, is_mandatory, max_choices, options } = req.body;

        if (!req.user) return AppResponse.error(res, 'Unauthorired', 401);
        const merchant_id = req.user.id;

        const result = await OptionGroupService.updateOptionGroup(merchant_id,Number(id), name, is_mandatory, max_choices, options);

        return AppResponse.success(res, result, "Cập nhật nhóm tùy chọn thành công!", 201);

    } catch (error) {
        next(error)
    }
}
export const deleteOptionGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) return AppResponse.error(res, 'Unauthorired', 401);
        const merchant_id = req.user.id;

        const { id } = req.params;

        const result =  await OptionGroupService.deleteOptionGroup(merchant_id,Number(id));

        return AppResponse.success(res, result, "Xóa nhóm tùy chọn thành công!", 200);
        
    } catch (error) {
        
    }
}