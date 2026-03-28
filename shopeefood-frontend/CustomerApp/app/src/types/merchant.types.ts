import { OptionGroup } from "./option.type";

export interface Merchant{
    account_id: number;
    name: string;
    address: string;
    phone: string;
    latitude: number;
    longitude: number;
    open_time: string;
    close_time: string;
    cover_image: string;
    status: string;
    categories: Categoty[];
}

export interface Categoty{
    id: number;
    merchant_id: 1;
    name: string
    foods: Food[]
}
export interface Food{
    id: number,
    category_id: number,
    name: string,
    description: string,
    price: number,
    image: string
    is_available: boolean,
    option_groups:OptionGroup[]
}

