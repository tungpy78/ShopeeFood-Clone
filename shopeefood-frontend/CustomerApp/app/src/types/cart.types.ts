import { Food } from "./merchant.types";

export interface CartItem {
  cartKey: string; //(VD: "10-{"1":[5]}")
  food_id: number;
  name: string;
  price: number;// Giá của 1 ly (đã cộng topping)
  quantity: number;
  image: string;
  merchant_id: number; // Để sau này check không cho đặt 2 quán cùng lúc
  optionsText: string; //(VD: "Trân châu trắng, Size L")
  rawOptions: any; //Để lát gửi xuống API Backend
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (food: Food, quantity: number, unitPrice: number, selectedOptions: any, optionsText: string, merchant_id: number) => void;
  updateQuantity: (cartKey: string, delta:number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalQuantity: number;
}