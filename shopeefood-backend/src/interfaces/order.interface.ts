export interface OrderDTO{
    merchant_id: number;
    shipping_address: string;
    payment_method: 'CASH' | 'MOMO' | 'ZALOPAY';
    items:[
        {
            food_id: number;
            quantity: number;
            option_ids: number[];
        }
    ]
}
