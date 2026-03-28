export interface MerChantDTO{
    name: string;
    address: string;
    phone: string;
    latitude?: number;
    longitude?: number;
    open_time?: string;
    close_time?: string;
    cover_image?: string;
}