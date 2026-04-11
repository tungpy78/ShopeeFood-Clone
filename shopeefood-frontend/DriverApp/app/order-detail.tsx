import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Order } from "./src/types/order.types";
import { driverService } from "./src/services/driver.service";
import { router } from "expo-router";
import { COLORS } from "./src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { title } from "node:process";
import { formatMoney } from "./src/utils/format";
import React from "react";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "./src/types/api.types";
import { useSocket } from "./src/context/SocketContext";

export default function OrderDetailScreen() {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState<'Merchant' | 'Customer'>('Merchant');

    const { socket } = useSocket();

    // 🔥 1. Gọi lại API lấy dữ liệu mới nhất
    const fetchOrderDetail = async () => {
        try {
            const res = await driverService.getActiveOrder();
            setOrder(res.data);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể tải chi tiết đơn hàng");
            router.replace('/')
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchOrderDetail();
    }, []);

    const renderStatus = (status: String) => {
        if(status === "DRIVER_PICKING") return(<Text style={{color:"green"}}>Tài xế đã nhận đơn</Text>);
        if(status === "DELIVERING") return(<Text style={{color:"green"}}>Tài xế đang giao</Text>);
    }

    const renderStatusNew = (status: String) => {
        if(status === "DRIVER_PICKING") return(<Text style={{color:"white", fontSize:18, fontWeight:500}}>Đã Lấy Hàng</Text>);
        if(status === "DELIVERING") return(<Text style={{color:"white", fontSize:18, fontWeight:500}}>Đã Giao Xong</Text>);
    }

    const handleUpdateProgress = async () => {
        if (!order) return;
        
        setUpdating(true);
        let nextStatus = '';
        if (order.status === 'DRIVER_PICKING') nextStatus = 'DELIVERING'; 
        if (order.status === 'DELIVERING') nextStatus = 'COMPLETED';     

        try {
            await driverService.updateOrderStatus(order.id, nextStatus);
            Alert.alert("Thành công", "Đã cập nhật trạng thái đơn hàng!");
            
            if (nextStatus === 'COMPLETED') {
                socket?.emit('driver_free');
                router.replace('/'); // Giao xong thì đá thẳng về màn hình chủ
            } else {
                fetchOrderDetail(); // Chưa xong thì load lại data
            }
        } catch (error: any) {
            Alert.alert("Lỗi", "Không thể cập nhật trạng thái!");
        } finally {
            setUpdating(false);
        }
    };

    const handleOpenMap = (address: string, lat?: string, lng?: string) => {
        let mapUrl = '';

        // Nếu backend có trả về tọa độ chính xác (ví dụ quán ăn thường có tọa độ)
        if (lat && lng) {
            mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        } 
        // Nếu không có tọa độ, ta dùng chuỗi địa chỉ (phải mã hóa chuỗi bằng encodeURIComponent để không bị lỗi khoảng trắng)
        else if (address) {
            mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
        }

        if (mapUrl) {
            Linking.canOpenURL(mapUrl).then(supported => {
                if (supported) {
                    Linking.openURL(mapUrl);
                } else {
                    Alert.alert("Lỗi", "Không thể mở Google Maps trên thiết bị này!");
                }
            });
        }
    };

    // 🔥 HÀM XỬ LÝ GỌI ĐIỆN THOẠI
    const handleCall = () => {
        if (!order) return;

        // 1. Xác định số điện thoại dựa trên Tab hiện tại
        let phoneNumber = '';
        if (activeTab === 'Merchant') {
            phoneNumber = order.merchant_info?.phone;
        } else {
            phoneNumber = order.customer_info?.account?.phone;
        }

        // 2. Kiểm tra nếu không có số điện thoại
        if (!phoneNumber) {
            Alert.alert("Lỗi", "Không tìm thấy số điện thoại của người này!");
            return;
        }

        // 3. Tạo URL với giao thức 'tel:' để ép điện thoại mở trình quay số
        const url = `tel:${phoneNumber}`;

        Linking.canOpenURL(url)
            .then((supported) => {
                if (!supported) {
                    Alert.alert("Lỗi", "Thiết bị của bạn không hỗ trợ chức năng gọi điện!");
                } else {
                    return Linking.openURL(url);
                }
            })
            .catch((err) => console.log("Lỗi gọi điện:", err));
    };

    if (loading) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    if (!order) return null;

    return(
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/')} style={{ padding: 5 }}>
                    <Ionicons name="arrow-back" size={28} color={COLORS.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === "Merchant" && styles.tabActive]}
                        onPress={() => setActiveTab('Merchant')}
                    >
                        <Text style={[styles.tabText, activeTab === "Merchant" && styles.tabTextActive]}>Delivery-Quán</Text>
                        <Text style={styles.orderId}>Mã đơn: #{order.id}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === "Customer" && styles.tabActive]}
                        onPress={() => setActiveTab('Customer')}
                    >
                        <Text style={[styles.tabText, activeTab === "Customer" && styles.tabTextActive]}>Khách hàng</Text>

                    </TouchableOpacity>
                </TouchableOpacity>
            </View>

            <View style={styles.bodyContainer}>
                {activeTab === "Merchant" ? (
                    <>
                        <View style={styles.info}>
                            <View>
                                <Text style={styles.subtitle}>{order.merchant_info.name}</Text>
                                <Text numberOfLines={2} style={styles.title}>{order.merchant_info.address}</Text>
                            </View>
                            <TouchableOpacity style={styles.icon} onPress={() => handleOpenMap(order.merchant_info.address, order.merchant_info.latitude, order.merchant_info.longitude)}>
                                <Ionicons name="return-up-forward-outline" size={20} color={COLORS.primary}/>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.info}>
                            <Text style={{color:"red"}}>Trả: {formatMoney(0)} - Lấy ngay</Text>
                        </View>
                        <View style={styles.infoStatus}>
                            <Text style={{color:COLORS.textLight, }}>Trạng thái - {renderStatus(order.status)}</Text>
                        </View>
                        <View style={styles.info}>
                            <View>
                                <Text style={styles.title}>Chi tiết đơn hàng</Text>
                                <Text style={styles.subtitle}>Số lương: {order?.items.length}</Text>
                            </View>
                        </View>
                        <View style={styles.info}>
                            <View>
                                <Text style={{color:COLORS.text}}>#Tên Món</Text>
                                <View style={styles.btn}>
                                    <Text>Món hiện có</Text>
                                </View>
                            </View>
                            <View style={styles.row}>
                                <Text style={{color:COLORS.textLight}}>SL</Text>
                                <Text style={{color:COLORS.text, marginLeft:10}}>Thành tiền</Text>
                            </View>
                        </View>
                        <View style={styles.rowLine} />
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.body}>
                            {order.items.map((i, index) => (
                                <React.Fragment key={i.food_id}>
                                    <View key={i.food_id} style={styles.row}>
                                    <Text>{index+1}.</Text>
                                    <View>
                                        <Text style={styles.foodName}>{i.food_name}</Text>
                                        <Text style={{width:200, flexWrap:"wrap", fontSize:14, color:COLORS.textLight}}>{i.options.map(i => i.name).join(",")}</Text>
                                    </View>
                                </View>
                                <View style={styles.row}>
                                    <Text style={{color:COLORS.primary, fontWeight:600}}>{i.quantity}</Text>
                                    <Text style={{color:COLORS.text, marginLeft:20}}>
                                         {formatMoney(Number(i.price) * Number(i.quantity))}
                                    </Text>
                                </View>
                                </React.Fragment>
                            ))}
                        </View> 
                        </ScrollView>
                    </>
                ) : (
                    <>
                    <View style={styles.info}>
                        <View>
                            <Text style={styles.subtitle}>{order.customer_info.full_name}</Text>
                            <Text numberOfLines={2} style={styles.title}>{order.shipping_address}</Text>
                        </View>
                        <TouchableOpacity style={styles.icon} onPress={() => handleOpenMap(order.shipping_address)}>
                            <Ionicons name="return-up-forward-outline" size={20} color={COLORS.primary}/>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.info}>
                        <Text style={{color:"green"}}>Thu: {formatMoney(Number(order.final_price))} - Giao ngay</Text>
                    </View>
                    <View style={styles.infoStatus}>
                        <Text style={{color:COLORS.textLight, }}>Trạng thái - {renderStatus(order.status)}</Text>
                    </View>
                    <View style={styles.info}>
                        <View>
                            <Text style={styles.title}>Chi tiết đơn hàng</Text>
                            <Text style={styles.subtitle}>Số lương: {order?.items.length}</Text>
                        </View>
                    </View>
                    <View style={styles.info}>
                        <View>
                            <Text style={{color:COLORS.text}}>#Tên Món</Text>
                            <View style={styles.btn}>
                                <Text>Món hiện có</Text>
                            </View>
                        </View>
                        <View style={styles.row}>
                            <Text style={{color:COLORS.textLight}}>SL</Text>
                            <Text style={{color:COLORS.text, marginLeft:10}}>Thành tiền</Text>
                        </View>
                    </View>
                    <View style={styles.rowLine} />
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.body}>
                        {order.items.map((i, index) => (
                            <React.Fragment key={i.food_id}>
                                <View key={i.food_id} style={styles.row}>
                                    <Text>{index+1}.</Text>
                                    <View >
                                        <Text style={styles.foodName}>{i.food_name}</Text>
                                        <Text style={{width:200, flexWrap:"wrap", fontSize:14, color:COLORS.textLight}}>{i.options.map(i => i.name).join(",")}</Text>
                                    </View>
                                </View>
                                <View style={styles.row}>
                                    <Text style={{color:COLORS.primary, fontWeight:600}}>{i.quantity}</Text>
                                    <Text style={{color:COLORS.text, marginLeft:20}}>
                                        {formatMoney(Number(i.price) * Number(i.quantity))}
                                    </Text>
                                </View>
                            </React.Fragment>
                        ))}
                    </View>
                    </ScrollView>
                    </>
                    
                )}
            </View>
            <View style={styles.footer}>
                <View style={styles.contact}>
                    <TouchableOpacity style={styles.card} onPress={handleCall}>
                        <Ionicons name="call-sharp" size={20}/>
                        <Text>Điện Thoại</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.card}>
                        <Ionicons name="chatbubble-sharp" size={20}/>
                        <Text>Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.card}>
                        <Ionicons name="backspace-sharp" size={20}/>
                        <Text>Từ chối</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.upStatus}>
                    <TouchableOpacity style={styles.btnStatus} onPress={handleUpdateProgress}>
                        <Text>{renderStatusNew(order.status)}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnVi}>
                        <Ionicons name="wallet-outline" size={20}/>
                        <Text>Ví</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </SafeAreaView>
    )
    
}

const styles = StyleSheet.create({
    container:{flex:1, backgroundColor: '#f5f5f5'},
    header:{flexDirection:"row", paddingTop: 40, alignItems:"center", borderBottomWidth: 1, borderBlockColor:"#ddd"},
    tabContainer:{flex: 1, flexDirection:"row", justifyContent:"space-around"},
    tabButton:{paddingBottom:5},
    tabActive:{borderBottomWidth:2, borderColor:COLORS.primary},
    tabText:{fontSize:17, color:COLORS.textLight, fontWeight:"500"},
    tabTextActive:{color:COLORS.primary, fontSize:18, fontWeight:"bold"},
    orderId:{fontSize:13, color:COLORS.text, fontWeight:"500"},
    bodyContainer:{flex:1, backgroundColor:"#ddd"},
    info:{flexDirection: "row", justifyContent:"space-between", alignItems:"center", borderBottomWidth:1, borderBlockColor:"#ddd", backgroundColor:"white",
        paddingVertical:15, paddingHorizontal:10,
    },
    subtitle:{fontSize:14, color:COLORS.textLight, fontWeight:"500"},
    title:{fontSize:16, width:300, color:COLORS.text, fontWeight:"600"},
    icon:{ height:30, width:30, borderRadius:15, backgroundColor:"white", justifyContent:"center", alignItems:"center", borderColor:"black", borderWidth:1},
    infoStatus:{
        flexDirection: "row", justifyContent:"center", alignItems:"center", borderBottomWidth:1, borderBlockColor:"#ddd", backgroundColor:"white",
        paddingVertical:15, paddingHorizontal:10
    },
    row:{flexDirection:"row", justifyContent:"space-between"},
    btn:{backgroundColor:COLORS.primary, padding:5, borderRadius:5},
    rowLine:{paddingVertical:5},
    body:{flex:1, backgroundColor:"white", flexDirection:"row", justifyContent:"space-between", paddingHorizontal:5,flexWrap:"wrap", paddingVertical:20},
    foodName:{fontSize:16, fontWeight:500, color:COLORS.text},
    footer:{},
    contact:{flexDirection:"row", justifyContent:"space-between", alignItems:"center", borderBottomWidth:1, borderColor:"#ddd"},
    card:{alignItems:"center", borderRightWidth:1 , padding:8, borderColor:"#ddd", width:"33%"},
    upStatus:{padding:10, flexDirection:"row", justifyContent:"space-between"},
    btnStatus:{backgroundColor:COLORS.primary, flex:1, justifyContent:"center", alignItems:"center", borderRadius:8, marginRight:10},
    btnVi:{height:50, width:100, alignItems:"center", borderLeftWidth:1, borderColor:"#ddd"},

})