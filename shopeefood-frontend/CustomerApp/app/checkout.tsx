import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { COLORS } from "./src/constants/theme";
import { router } from "expo-router";
import { useCart } from "./src/context/CartContext";
import { useAuth } from "./src/context/AuthContext";
import { useState } from "react";
import { orderService } from "./src/services/order.service";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "./src/types/api.types";
import { formatMoney } from "./src/utils/format";

export default function CheckoutScreen() {
    const { cart, totalPrice, clearCart } = useCart();
    const { user } = useAuth();

    const [address, setAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH'); // Mặc định là Tiền mặt
    const [loading, setLoading] = useState(false);

    const shippingFee = 15000; // Giống backend fix cứng 15k
    const finalPrice = totalPrice + shippingFee;

    const handlePlaceOrder = async () =>{
      if(!address.trim()){
        Alert.alert('Thiếu thông tin', 'Vui lòng nhập địa chỉ giao hàng!');
        return;
      }

      if(cart.length === 0){
        Alert.alert('Lỗi', 'Giỏ hàng của bạn đang trống!');
        return;
      }

      setLoading(true);

      try {
        // 1. Chuẩn hóa mảng items từ Giỏ hàng cho đúng chuẩn Backend
        const formattedItems = cart.map(item => {
          // Biến object rawOptions { 1: [5, 6], 2: [12] } thành mảng phẳng [5, 6, 12]
          let optionIds: number[] = [];
          if(item.rawOptions){
            Object.values(item.rawOptions).forEach((arr: any) => {
              optionIds = [...optionIds, ...arr];
            });
          }
          
          return{
            food_id:item.food_id,
            quantity: item.quantity,
            option_ids: optionIds
          };

        });

        const orderPayload = {
          merchant_id: cart[0].merchant_id,
          shipping_address: address,
          payment_method: paymentMethod,
          items: formattedItems
        }

        const res = await orderService.createOrder(orderPayload);

        clearCart();
        Alert.alert(
            'Thành công 🎉', 
            res.message ?? 'Đơn hàng của bạn đã được đặt thành công!',
            [{ text: 'Xem đơn hàng', onPress: () => router.replace('/(tabs)/orders') }]
        );

      } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>
        console.log("errOder", err.response?.data);
        Alert.alert('Đặt hàng thất bại', err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
      }finally{
        setLoading(false);
      }
    }

    return (
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
      >
        <View style={styles.header}>
            <TouchableOpacity style={styles.btnClose} onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={COLORS.text}/>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Xác nhận đơn hàng</Text>
            <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 15 }}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Giao đến</Text>
            <View style={styles.inputGroup}>
              <Ionicons name="location" size={20} color={COLORS.primary} style={styles.icon}/>
              <TextInput 
                style={styles.input}
                placeholder="Nhập địa chỉ nhận hàng (Ví dụ: Số 1, Đường...)"
                value={address}
                onChangeText={setAddress}
                multiline
                textAlignVertical="top"
                numberOfLines={4}
              />
            </View>
            <View style={styles.inputGroup}>
              <Ionicons name="person" size={20} color={COLORS.textLight} style={styles.icon}/>
              <Text style={{ color: COLORS.text }}>{user?.phone}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
            {cart.map(item => (
              <View key={item.cartKey} style={styles.orderItem}>
              <Text style={styles.itemQty}>{item.quantity}</Text>
              <View style={{flex:1}}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.optionsText ? <Text style={styles.itemOpts}>{item.optionsText}</Text> : null}
              </View>
              <Text style={styles.itemPrice}>{formatMoney(item.price)}</Text>
            </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thanh toán</Text>
            <TouchableOpacity style={styles.paymentMethod}>
              <Ionicons name="cash" size={24} color="#4CAF50"/>
              <Text style={styles.paymentText}>Tiền mặt khi nhận hàng (COD)</Text>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
            <View style={styles.billRow}>
              <Text style={styles.billText}>Tổng tiền món ({cart.reduce((sum, i) => sum + i.quantity, 0)} món)</Text>
              <Text style={styles.billText}>{formatMoney(totalPrice)}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billText}>Phí giao hàng</Text>
              <Text style={styles.billText}>{formatMoney(shippingFee)}</Text>
            </View>
            <View style={[styles.billRow, { borderTopWidth: 1, borderColor: '#eee', marginTop: 10, paddingTop: 10 }]}>
              <Text style={styles.billTotalText}>Tổng cộng</Text>
              <Text style={styles.billTotalPrice}>{formatMoney(finalPrice)}</Text>
            </View>
          </View>
          <View style={{ height: 80 }} />
        </ScrollView>

        <View style={styles.footer}>  
          <View style={styles.footerInfo}>
            <Text style={styles.footerTotalLabel}>Tổng thanh toán</Text>
            <Text style={styles.footerTotalPrice}>{formatMoney(finalPrice)}</Text>
          </View>
          <TouchableOpacity 
              style={[styles.placeOrderBtn, loading && { opacity: 0.7 }]}
              disabled={loading}
              onPress={handlePlaceOrder}
          >
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.placeOrderText}>Đặt đơn</Text>}
          </TouchableOpacity>
        </View>
        

      </KeyboardAwareScrollView>  
    );
}

const styles = StyleSheet.create({
   container:{flex:1, backgroundColor: '#f8f8f8'},
   header:{flexDirection:"row", justifyContent:"space-between", alignItems:"center", padding:15, paddingTop:40, backgroundColor:COLORS.white, borderBottomWidth:1, borderColor:"#eee"},
   btnClose:{padding:5},
   headerTitle:{fontSize: 18, fontWeight:"bold"},
   section:{backgroundColor:COLORS.white, padding:15, borderRadius:12, marginBlock:15 },
   sectionTitle:{fontSize:16, fontWeight:"bold", marginBottom:15, color:COLORS.text},
   inputGroup:{flexDirection:"row", alignItems:"center", backgroundColor: '#f5f5f5', padding:12, borderRadius:8, marginBottom:12},
   icon:{marginRight:10},
   input:{flex:1, fontSize: 15, color: COLORS.text},
   orderItem:{flexDirection:"row", marginBottom: 12},
   itemQty:{fontWeight: 'bold', marginRight: 10, color: COLORS.primary},
   itemName:{fontSize: 15, fontWeight: '500'},
   itemOpts:{fontSize: 13, color: '#666', marginTop: 2},
   itemPrice: { fontSize: 15, fontWeight: '500' },
   paymentMethod:{flexDirection:"row", marginBottom:12, backgroundColor:"#fff0ed", padding:15, alignItems:"center", borderWidth:1, borderColor:COLORS.primary,
    borderRadius:8
   },
   paymentText:{flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '500'},
   billRow:{flexDirection:"row", justifyContent:"space-between", alignItems:"center",marginBottom:8},
   billText:{fontSize: 14, color: '#555'},
   billTotalText:{fontSize: 16, fontWeight: 'bold'},
   billTotalPrice: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
   footer:{flexDirection:"row", justifyContent:"space-between", alignItems:"center",backgroundColor: 'white', padding:15,borderTopWidth: 1, borderColor: '#eee', paddingBottom: Platform.OS === 'ios' ? 30 : 15},
   footerInfo:{flex:1},
   footerTotalLabel:{fontSize:14, color:"#555"},
   footerTotalPrice:{fontSize:20, fontWeight:"bold",color:COLORS.primary},
   placeOrderBtn:{backgroundColor:COLORS.primary, paddingVertical:14, paddingHorizontal:30, borderRadius:8},
   placeOrderText:{color: 'white', fontSize: 16, fontWeight: 'bold'}

});