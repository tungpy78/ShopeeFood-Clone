import { COLORS } from "@/app/src/constants/theme";
import { customerService } from "@/app/src/services/customer.service";
import { Categoty, Food, Merchant } from "@/app/src/types/merchant.types"
import { Ionicons } from "@expo/vector-icons";
import { AxiosError } from "axios";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { formatMoney } from "../src/utils/format";
import { useCart } from "../src/context/CartContext";
import { ApiErrorResponse } from "../src/types/api.types";
import FoodOptionModal from "../src/components/FoodOptionModal";
import CartModal from "../src/components/CartModal";
import { useAuth } from "../src/context/AuthContext";

function MerchantMenuScreen(){
    const [merchantData, setMerchantData] = useState<Merchant>();
    const [loading, setLoading] = useState(true);
    const { id } = useLocalSearchParams(); // Lấy cái ID từ URL
    const { addToCart, totalQuantity, totalPrice } = useCart();

    const [isModalFoodDetail, setIsModalFoodDetail] = useState(false);
    const [isCartModalVisible, setIsCartModalVisible] = useState(false);
    const [selectedFood, setSelectedFood] = useState<Food | null>(null);
    const {isAuthenticated} = useAuth();

    const fetchMerchantData = async () => {
        try {
            const res = await customerService.getMerchantMenu(Number(id))
            setMerchantData(res.data)
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>
            const errMessage = err.response?.data.message ?? "Kết nối máy chủ thất bại"
            Alert.alert("Thông báo lỗi", errMessage);
        }finally{
            setLoading(false);
        }
    }
    
    useEffect(() => {
        if (id) fetchMerchantData();
    },[id])

    if(loading){
        <View style={styles.center}>
            <ActivityIndicator  size="large" color={COLORS.primary}/>
        </View>
    }

    if(!merchantData) return <View style={styles.center}><Text>Không tìm thấy quán</Text></View>;

    return(
        <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.container}>
            {/* Header Nút Back */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{marginBottom:50}}>
                <Image source={{uri: merchantData.cover_image}} style={styles.image}/>
                <View style={styles.infoBox}>
                    <Text style={styles.nameMerchant}>{merchantData.name}</Text>
                    <View style={styles.rowAddress}>
                        <Ionicons name="location"size={16} color={COLORS.primary} />
                        <Text style={styles.addressMerchant}>{merchantData.address}</Text>
                    </View>
                </View>

                <View style={styles.menuContainer}>
                    {merchantData.categories.map((category: Categoty) => (
                       <View key={category.id} style={styles.categorySection}>
                        <Text style={styles.nameCategory}>{category.name}</Text>
                        
                        {category.foods.map((food: Food) => (
                            
                            <TouchableOpacity key={food.id} style={styles.foodItem}>
                                <Image source={{uri:food.image}} style={styles.imageFood}/>
                                <View style={styles.foodInfo}>
                                    <Text style={styles.foodName}>{food.name}</Text>
                                    <Text numberOfLines={2} style={styles.foodDesc}>{food.description}</Text>
                                    <View style={styles.priceRow}>
                                        <Text style={styles.priceTitle}>{formatMoney(food.price)}</Text>
                                        <TouchableOpacity style={styles.addButton} onPress={() => {
                                            setSelectedFood(food);
                                            setIsModalFoodDetail(true);
                                        }} >
                                            <Ionicons  name="add" size={20} color={COLORS.white}/>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            
                            
                        ))}
                       </View> 
                    ))}
                </View>


            </ScrollView>

            {/* GỌI MODAL RA CỰC KỲ GỌN GÀNG */}
            <FoodOptionModal 
                visible={isModalFoodDetail}
                food={selectedFood}
                onClose={() => setIsModalFoodDetail(false)}
                onAddToCart={(food, quantity, unitPrice, selectedOptions, optionsText) => {
                    console.log("Sẵn sàng thêm vào giỏ:", food.name, quantity, selectedOptions, unitPrice,optionsText);
                    // Gọi hàm addToCart từ Context của em ở đây
                    addToCart(food, quantity, unitPrice, selectedOptions, optionsText, merchantData.account_id);
                }}
            />
            <CartModal visible={isCartModalVisible} onClose={() => setIsCartModalVisible(false)} />
            {/* THANH GIỎ HÀNG NỔI Ở ĐÁY MÀN HÌNH (Chỉ hiện khi có đồ) */}
            {totalQuantity > 0 && (
                <View style={{
                position: 'absolute', bottom: 20, left: 15, right: 15,
                backgroundColor: COLORS.primary, padding: 15, borderRadius: 8,
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity style={{flexDirection:"row"}} onPress={() => setIsCartModalVisible(true)}>
                        <Ionicons name="cart" size={24} color={COLORS.white} />
                        <View style={{width:15, height:15, backgroundColor:"white", justifyContent:"center", alignItems:"center", borderRadius:"50%", marginRight:10}}>
                            <Text style={{ color: COLORS.primary, fontSize:10}}>{totalQuantity}</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{formatMoney(totalPrice)}</Text>
                </View>
                <TouchableOpacity
                onPress={() => {
                    if (!isAuthenticated) {
                        // Chuyển hướng sang trang đăng nhập
                        router.push('/login'); 
                        // (Lưu ý: Giỏ hàng vẫn được giữ nguyên trong Context, không bị mất)
                    } else {
                        router.push('/checkout'); 
                    }
                }}
                >
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Giao hàng 🚀</Text>
                </TouchableOpacity>
                </View>
            )}

        </View>
        </>
    )
}

const styles = StyleSheet.create({
    center:{
        flex: 1,
        justifyContent:"center",
        alignItems:"center"
    },
    container:{
        flex:1,
        backgroundColor: COLORS.background
    },
    header: {
        position: 'absolute', top: 30, left: 15, zIndex: 10,
    },
    image:{
        width: "100%",
        height:220,
        objectFit:"cover"
    },
    infoBox:{
        backgroundColor: COLORS.white,
        padding:20,
        paddingHorizontal: 15,
        borderRadius: 12,
        marginTop: -30,
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4,
    },
    nameMerchant:{
        fontSize:22,
        fontWeight:"bold",
        color: COLORS.text
    },
    rowAddress:{
        flexDirection:"row",
        alignItems:"center"
    },
    addressMerchant:{
        fontSize:14,
        flex:1,
        color:COLORS.textLight,
        marginLeft:6
    },
    menuContainer:{
        padding:15,
        marginTop:10
    },
    categorySection:{
        marginBottom: 25
    },
    nameCategory:{
        fontSize:18,
        fontWeight:"bold",
        color:COLORS.text,
        marginBottom:15
    },
    foodItem:{
        borderRadius:12,
        backgroundColor:COLORS.white,
        marginBottom:10,
        flexDirection:"row",
        padding:10
    },
    imageFood:{
        width:80,
        height:80,
        borderRadius:8
    },
    foodInfo:{
        flex:1,
        justifyContent:"space-between",
        marginLeft:12
    },
    foodName:{
        fontSize:16,
        color:COLORS.text,
        fontWeight:"600"
    },
    foodDesc: { fontSize: 13, color: COLORS.textLight, marginTop: 4 },
    priceRow:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
    },
    priceTitle:{
        fontSize: 16, fontWeight: 'bold', color: COLORS.primary
    },
    addButton:{
        borderRadius:8,
        backgroundColor:COLORS.primary,
        width: 30, height: 30,
        justifyContent:"center",
        alignItems:"center"
    },
})

export default MerchantMenuScreen