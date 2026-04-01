export interface Order{
    merchant_id: number;
    shipping_address: string;
    payment_method: string;
    items:[
        {
            food_id: number, 
            quantity: number,
            option_ids: []
        }
    ]
}

export interface OrderHistory{
    id: number;
    customer_id: number;
    merchant_id: number;
    driver_id: number;
    tolal_price: number;
    shipping_price: number;
    final_price: number;
    shipping_address: string;
    payment_method: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    merchant_info:{
        account_id: number,
        name: string,
        address: string,
        phone: string,
        cover_image: string,
    },
    items:[
        {
            id: number,
            order_id: number,
            food_id: number,
            food_name: string,
            food_image: string,
            quantity: number,
            price: number,
            "options": [
                {
                    name: string,
                    price: number
                }
            ]
        }
    ]

}