export interface Order {
  id: number;
  customer_id: number;
  merchant_id: number;
  driver_id: number;

  total_price: string;
  shipping_fee: string;
  final_price: string;

  shipping_address: string;
  payment_method: string;
  status: string;

  createdAt: string;
  updatedAt: string;

  merchant_info: MerchantInfo;
  customer_info: CustomerInfo;
  items: OrderItem[];
}
export interface MerchantInfo {
  name: string;
  address: string;
  phone: string;
  latitude: string;
  longitude: string;
}
export interface CustomerInfo {
  full_name: string;
  account: {
    phone: string;
  };
}
export interface OrderItem {
  id: number;
  order_id: number;
  food_id: number;

  food_name: string;
  food_image: string;

  quantity: number;
  price: number;

  options:[
    {
      name: string;
      price: number;
    }
  ]
  food_info: {
    name: string;
    image: string;
    }
}