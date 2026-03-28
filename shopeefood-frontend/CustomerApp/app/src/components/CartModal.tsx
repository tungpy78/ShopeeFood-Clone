import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../context/CartContext";
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../constants/theme";
import { formatMoney } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function CartModal({visible, onClose}: Props){
    const {cart, updateQuantity, clearCart, totalPrice} = useCart();
    const {isAuthenticated} = useAuth();

    
    return(
        <>
        <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.bottomSheet}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => {clearCart(),onClose()}}>
                            <Text style={styles.clearText}>Xóa tất cả</Text>
                        </TouchableOpacity>
                        <Text style={styles.cartText}>Giỏ hàng</Text>
                        <TouchableOpacity onPress={() => onClose()}>
                            <Ionicons name="close" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={{maxHeight:400}}>
                        {cart.map((item) => (
                            <View key={item.cartKey} style={styles.cartItem}>
                                <Image source={{uri:item.image}} style={styles.foodImage}/>
                                <View style={styles.foodInfo}>
                                    <Text style={styles.foodName}>{item.name}</Text>
                                    {item.optionsText ? (
                                        <Text style={styles.optText}>{item.optionsText}</Text>
                                    ): null}
                                    <View style={styles.priceRow}>
                                        <Text style={styles.itemPrice}>{formatMoney(item.price)}</Text>
                                        <View style={styles.quantityControll}>
                                            <TouchableOpacity onPress={() => updateQuantity(item.cartKey, -1)}>
                                                <Ionicons name="remove-circle-outline" size={28} color={COLORS.primary}/>
                                            </TouchableOpacity>
                                            <Text style={styles.quantityText}>{item.quantity}</Text>
                                            <TouchableOpacity onPress={() => updateQuantity(item.cartKey, 1)}>
                                                <Ionicons name="add-circle-outline" size={28} color={COLORS.primary}/>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                    <Text style={{color:COLORS.textLight, fontSize:12}}>Giá món đã bao gồm thuế, nhưng chưa bao gồm phí giao hàng và các chi phí khác</Text>

                    <View style={styles.footer}>
                        <View style={styles.totalBadge}>
                            <Text>{cart.reduce((sum,i) => sum + i.quantity, 0)}</Text>
                        </View>
                        <Text style={styles.totalPriceText}>{formatMoney(totalPrice)}</Text>
                        <TouchableOpacity 
                        style={styles.checkoutBtn}
                        onPress={() => {
                            if (!isAuthenticated) {
                                // Đóng modal giỏ hàng lại cho gọn
                                onClose(); 
                                // Chuyển hướng sang trang đăng nhập
                                router.push('/login'); 
                                // (Lưu ý: Giỏ hàng vẫn được giữ nguyên trong Context, không bị mất)
                            } else {
                                // Nếu đăng nhập rồi thì sang trang Thanh Toán thật
                                onClose();
                                router.push('/checkout'); 
                            }
                        }}>
                            <Text style={styles.checkoutText}>Giao hàng 🚀</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    overlay:{
        flex:1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent:"flex-end"
    },
    bottomSheet:{
        backgroundColor:"white",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding:15
    },
    header:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        paddingVertical:15,
        borderBottomWidth:1,
        borderColor:"#f5f5f5"
    },
    clearText:{
        fontSize: 14,
        color:COLORS.primary,
    },
    cartText:{fontSize:18, fontWeight:"bold"},
    cartItem:{
        flexDirection:"row",
        paddingVertical:15,
        borderBottomWidth:1,
        borderColor:"#f5f5f5",
    },
    foodImage:{
        width:50,
        height:50,
        objectFit:"cover"
    },
    foodInfo:{
        flex:1,marginLeft: 12, justifyContent: 'space-between'
    },
    foodName:{
        fontSize:16,
        fontWeight:"bold"
    },
    optText:{
        fontSize:13,
        color:"#666",
        marginTop:2
    },
    priceRow:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        marginTop:8,
    },
    itemPrice:{color:COLORS.primary,fontSize: 16, fontWeight: 'bold'},
    quantityControll:{
        flexDirection:"row",
        alignItems:"center"
    },
    quantityText:{marginHorizontal:12, fontSize: 16, fontWeight: 'bold'},
    footer:{
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        paddingVertical:10,
        paddingHorizontal:7,
        backgroundColor:COLORS.primary,
        borderRadius:8,
    },
    totalBadge:{
        width:25,
        height:25,
        backgroundColor:"white",
        alignItems:"center",
        justifyContent:"center",
        borderRadius:"50%"
    },
    totalPriceText:{flex:1,color:COLORS.white, fontSize:18, fontWeight:"bold", marginLeft:10},
    checkoutBtn:{paddingHorizontal:10, backgroundColor:"white", paddingVertical:7, borderRadius:8},
    checkoutText:{color:COLORS.primary, fontSize: 16, fontWeight:"bold"}
})