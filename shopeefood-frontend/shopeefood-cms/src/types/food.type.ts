import type { OptionGroup } from "./option.type";

export interface Food {
    id: number;
    name: string;
    description?: string;
    price: number;
    image: string; // Link ảnh từ Cloudinary
    category_id: number; // Thuộc danh mục nào
    is_available: boolean; // Trạng thái còn hàng / hết hàng (hoặc status)
}

export interface CreateFoodRequest {
    id:number;
    name: string;
    description?: string;
    price: number;
    image: string;
    category_id: number;
    is_available?: boolean;
    option_groups: OptionGroup[]
}
