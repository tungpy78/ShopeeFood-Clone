import React, { createContext, useContext, useState } from "react";
import { CartContextType, CartItem } from "../types/cart.types";
import { Food } from "../types/merchant.types";

// 1. Khởi tạo Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// 2. Tạo Provider (Cái vỏ bọc cung cấp dữ liệu cho toàn App)
export const CartProvider = ({children} : {children: React.ReactNode}) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (food: Food, quantity: number, unitPrice: number, selectedOptions: any, optionsText: string, merchant_id: number) => {
        setCart((prevCart) => {
            if (prevCart.length > 0 && prevCart[0].merchant_id !== merchant_id) {
                alert('Bạn chỉ có thể đặt món từ 1 quán trong 1 lần. Vui lòng xóa giỏ hàng cũ!');
                return prevCart;
            }

            const optionString = JSON.stringify(selectedOptions);
            const cartKey = `${food.id}-${optionString}`;



            const existingItemIndex = prevCart.findIndex(item => item.cartKey === cartKey);
            
            if(existingItemIndex >= 0){
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += quantity;
                return newCart;
            }else{
                return [...prevCart,{
                    cartKey:cartKey,
                    food_id: food.id,
                    name: food.name,
                    price: unitPrice,
                    quantity:quantity,
                    image: food.image,
                    merchant_id: merchant_id,
                    optionsText: optionsText, 
                    rawOptions: selectedOptions
                }];
            }
        });
    };

    const updateQuantity = (cartKey: string, delta: number) => {
        setCart((prevCart) => {
            return prevCart.map(item =>{
                if(item.cartKey === cartKey){
                    const newQuantity = item.quantity + delta;
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(item => item.quantity  > 0);
        })
    }

    const clearCart = () => setCart([]);

    const totalPrice = cart.reduce((sum,item) => sum + item.quantity * item.price ,0)
    const totalQuantity = cart.reduce((sum,item) => sum + item.quantity,0);

    return(
        <CartContext.Provider value={{cart,addToCart,updateQuantity,clearCart,totalPrice,totalQuantity}} >
            {children}
        </CartContext.Provider>
    )
}


export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart phải nằm trong CartProvider');
    return context;
}
