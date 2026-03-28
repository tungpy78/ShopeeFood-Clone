export interface FoodDTO {
    category_id: number;
    name: string;
    price: number;
    description?: string;
    image?: string;
    is_available?: boolean;
    option_groups:[]
}
