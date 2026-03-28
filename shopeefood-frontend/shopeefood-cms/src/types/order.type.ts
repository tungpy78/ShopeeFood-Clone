export interface OrderItem {
  id: number;
  order_id: number;
  food_id: number;
  quantity: number;
  price: number;
  options: Option[]; 
  food_info: FoodInfo; // Thông tin món ăn (tên, hình ảnh) để hiển thị trong danh sách đơn hàng
}
export interface Option{
    name: string;
    price: number;
}
export interface FoodInfo {
    name: string;
    image: string;
}

export interface Order {
  id: number;
  user_id: number;
  merchant_id: number;
  driver_id?: number;
  total_price: number;
  shipping_fee: number;
  final_price: number;
  shipping_address: string;
  payment_method: string;
  status: 'PENDING' | 'PREPARING' | 'DRIVER_PICKING' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[]; // Chứa danh sách chi tiết các món khách đặt
  customer_info: {
    full_name: string;
    account:{
        phone: string;
    }
  }
}