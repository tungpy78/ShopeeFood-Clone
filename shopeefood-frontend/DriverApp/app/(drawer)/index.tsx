import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import MapView, { Marker } from 'react-native-maps';
import { router, useNavigation } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { Order } from '../src/types/order.types';
import { driverService } from '../src/services/driver.service';
import { COLORS } from '../src/constants/theme';
import { formatMoney } from '../src/utils/format';
import { useSocket } from '../src/context/SocketContext';
import { DrawerActions } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';

export default function HomeScreen() {
    const { user, checkAuth } = useAuth();
    
    const { isOnline, toggleOnline: handleToggleStatus, loadingToggle, orderUpdateTrigger, socket } = useSocket();

    const [activeTab, setActiveTab] = useState<'AVAILABLE' | 'ACTIVE'>('AVAILABLE');

    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [loadingActive, setLoadingActive] = useState(false);

    const navigation = useNavigation<DrawerNavigationProp<any>>();

    const fetchActiveOrder = async () => {
        setLoadingActive(true);
        try {
            const res = await driverService.getActiveOrder();
            setActiveOrder(res.data);
            socket?.emit('driver_busy');
        } catch (error) {
            console.log("Chưa có đơn hàng hoặc lỗi:", error);
            setActiveOrder(null);
            socket?.emit('driver_free');
        }finally{
            setLoadingActive(false)
        }
    }
    
    useEffect(() => {
        if (isOnline) {
            fetchActiveOrder();
        }
    }, [isOnline, orderUpdateTrigger]);

    useEffect(() => {
        if (activeOrder) {
            setActiveTab('ACTIVE'); 
        }
    }, [activeOrder]);


    // ==========================================
    // TRƯỜNG HỢP 1: TÀI XẾ ĐANG CHỜ ADMIN DUYỆT
    // ==========================================
    if (user?.status === 'PENDING_APPROVAL') {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Ionicons name="time-outline" size={100} color={COLORS.primary} />
                <Text style={styles.title}>Đang chờ xét duyệt</Text>
                <Text style={styles.subtitle}>
                    Hồ sơ của bạn đã được ghi nhận. Admin đang tiến hành kiểm tra thông tin (CCCD, Biển số xe). 
                    Vui lòng quay lại sau 24h nhé!
                </Text>
                <TouchableOpacity style={styles.refreshBtn}>
                    <Text style={styles.refreshBtnText}>Tải lại trạng thái</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // ==========================================
    // TRƯỜNG HỢP 2: TÀI XẾ BỊ KHÓA TÀI KHOẢN (BANNED)
    // ==========================================
    if (user?.status === 'BANNED') {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Ionicons name="lock-closed-outline" size={100} color="red" />
                <Text style={[styles.title, { color: 'red' }]}>Tài khoản bị khóa</Text>
                <Text style={styles.subtitle}>
                    Tài khoản của bạn đã bị vô hiệu hóa do vi phạm chính sách cộng đồng (vd: Boom đơn, thái độ không tốt).
                </Text>
            </SafeAreaView>
        );
    }

    // ==========================================
    // TRƯỜNG HỢP 3: TÀI XẾ ACTIVE - HIỂN THỊ RADAR QUÉT ĐƠN
    // ==========================================
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.infoDriver} onPress={() => navigation.openDrawer()}>
                    <Image source={{uri: user?.avatar}} style={styles.avatar}/>
                    <View>
                        <Text style={styles.nameDriver}>{user?.full_name}</Text>
                        <Text style={{color: isOnline ? "green" : COLORS.textLight, fontWeight:"bold"}}>
                            {isOnline ? "Đang trực tuyến" : "Tạm nghỉ"}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'AVAILABLE' && styles.tabActive]}
                    onPress={() => setActiveTab('AVAILABLE')}
                    disabled={!!activeOrder}
                >
                    <Text style={[styles.tabText, activeTab ==='AVAILABLE' && styles.tabTextActive, !!activeOrder && {opacity: 0.3}]}>FREE-PICK</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'ACTIVE' && styles.tabActive]}
                    onPress={() => setActiveTab('ACTIVE')}
                >
                    <Text style={[styles.tabText, activeTab ==='ACTIVE' && styles.tabTextActive]}>ĐANG LÀM</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.bodyContainer}>
                {!isOnline ? (
                    <View style={styles.offlineContainer}>
                        <View style={styles.offlineCricle}>
                            <Ionicons name='bicycle' size={60} color="white" />
                        </View>
                        <Text style={styles.offlineTitle}>Tạm nghỉ</Text>
                        <Text style={styles.offlineSubTitle}>Thay đổi trạng thái làm việc để nhận đơn hàng mới.</Text>
                    </View>
                ): (
                    activeTab === 'AVAILABLE' ? (
                        <View style={styles.mapContainer}>
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: 10.762622,
                                    longitude: 106.660172,
                                    latitudeDelta: 0.05, 
                                    longitudeDelta: 0.05,
                                }}
                            >
                                <Marker
                                    coordinate={{latitude: 10.762622, longitude: 106.660172}}
                                    title="Vị trí của bạn"
                                >
                                    <View style={styles.markerContainer}>
                                        <Image source={{uri: user?.avatar}} style={styles.markerAvatar}/>
                                    </View>
                                </Marker>
                            </MapView>

                            <View style={styles.radarScanningBox}>
                                <ActivityIndicator size="small" color={COLORS.primary} />
                                <Text style={styles.radarScanningText}>Đang dò tìm đơn hàng...</Text>
                            </View>
                        </View>
                    ) : (
                        loadingActive ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
                        ) : activeOrder ? (
                            <TouchableOpacity style={styles.activeOrderCard} onPress={() => router.replace("/order-detail")}>
                                <View style={styles.activeHeader}>
                                    <View style={styles.rowTitle}>
                                        <Text style={styles.orderTitle}>Mã đơn: #{activeOrder.id}</Text>
                                        <View style={styles.rowTitle}>
                                            <Ionicons name='restaurant' size={15} color={COLORS.primary} />
                                            <Text style={{color:COLORS.primary, marginLeft:2}} >Delivery</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.subtitleOder}>{formatMoney(Number(activeOrder.shipping_fee))}</Text>
                                </View>
                                <View style={styles.cardInfo}>
                                    <View style={styles.rowTitle}>
                                        <Text style={styles.subtitleOder}>Lấy: {activeOrder.merchant_info.name}</Text>
                                        <Text style={{color:"red"}}>Trả: 0đ</Text>
                                    </View>
                                    <Text style={styles.titleOrder}>{activeOrder.merchant_info.address}</Text>
                                    <View style={styles.btn}>
                                        <Text style={{color:"red"}}>Lấy ngay</Text>
                                    </View>
                                </View>

                                <View style={styles.routeLine} />

                                <View style={styles.cardInfo}>
                                    <View style={styles.rowTitle}>
                                        <Text style={styles.subtitleOder}>Giao: {activeOrder.customer_info.full_name}</Text>
                                        <Text style={{color:"green"}}>Thu: {formatMoney(Number(activeOrder.final_price))}</Text>
                                    </View>
                                    <Text style={styles.titleOrder}>{activeOrder.shipping_address}</Text>
                                    <View style={styles.rowBtn}>
                                        <View style={styles.btn}>
                                            <Text style={{color:"green"}}>Giao ngay</Text>
                                        </View>
                                        <View style={styles.btn}>
                                            <Text style={{color:COLORS.text}}>3.2km</Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ): (
                            <View style={styles.onlineContainer}>
                                <Ionicons name="document-text-outline" size={60} color={COLORS.textLight} />
                                <Text style={styles.onlineText}>Bạn chưa có đơn hàng nào đang giao.</Text>
                            </View>
                        )
                    )
                )}

            </View>

            {activeTab === 'AVAILABLE' && !isOnline &&(
                <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[styles.bigBtn, {backgroundColor: isOnline ? "#dc3545" : "#E84A27"}]}
                    onPress={handleToggleStatus}
                    disabled={loadingToggle}
                >
                    {loadingToggle ? (
                        <ActivityIndicator color="white" />
                    ): (
                        <>
                            <Ionicons name="power" size={24} color="white" style={{ position: 'absolute', left: 20 }} />
                            <Text style={styles.bigBtnText}>{isOnline ? 'Tạm nghỉ' : 'Sẵn sàng hoạt động'}</Text>
                        </>
                    )}
                    
                </TouchableOpacity>
            </View>
            )}
            
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'white' },
    title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginTop: 20, marginBottom: 10 },
    subtitle: { fontSize: 16, color: COLORS.textLight, textAlign: 'center', lineHeight: 24 },
    refreshBtn: { marginTop: 30, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: 8 },
    refreshBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    
    // Styles cho Radar
    header: { 
        padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee',
        paddingTop:50
    },
    infoDriver:{flexDirection:"row", alignItems:"center"},
    avatar:{height:50, width:50, borderRadius: 25, marginRight:10},
    nameDriver:{fontSize:18, fontWeight:"bold"},

    tabContainer:{flexDirection:"row",backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee'},
    tabButton:{flex:1, alignItems: 'center', paddingVertical:15},
    tabActive:{borderBottomWidth:3, borderBottomColor: COLORS.primary},
    tabText:{fontSize:14, fontWeight:"600", color:COLORS.textLight},
    tabTextActive:{fontSize:15, fontWeight:"bold", color:COLORS.primary},


    bodyContainer:{flex:1, backgroundColor: '#f0f2f5'},
    offlineContainer:{flex: 1, justifyContent: 'center', alignItems: 'center', padding:30},
    offlineCricle:{height:140, width:140, borderRadius:"50%", alignItems:"center", justifyContent:"center", backgroundColor:"#2C3E50", marginBottom:20},
    offlineTitle:{fontSize: 22, fontWeight:"bold", color: COLORS.text, marginBottom: 10},
    offlineSubTitle:{fontSize: 15, color: COLORS.textLight, textAlign: 'center', lineHeight: 22},
    onlineContainer:{flex:1, justifyContent: 'center', alignItems: 'center'},
    onlineText:{marginTop: 15, fontSize: 15, color: COLORS.textLight},

    bottomContainer:{padding: 15, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee'},
    bigBtn:{
        height:55, borderRadius:8, flexDirection:"row",
        justifyContent: 'center', alignItems: 'center', position: 'relative'
    },
    bigBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

    mapContainer:{flex:1, position:"relative"},
    map:{...StyleSheet.absoluteFillObject},
    markerContainer:{
        height:44, width:44, borderRadius:22,
        backgroundColor:COLORS.primary, justifyContent: 'center', alignItems: 'center',
        borderWidth:3, borderColor: 'white',
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 5
    },
    markerAvatar: { width: 36, height: 36, borderRadius: 18 },
    radarScanningBox:{
        position: 'absolute', top: 20, alignSelf: 'center',
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
        paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3
    },
    radarScanningText:{color:COLORS.primary, marginLeft:5, fontWeight:"500"},


    activeOrderCard:{
        flex:1, paddingVertical:10
    },
    activeHeader:{
        backgroundColor:"#FCF9E8",padding:5, justifyContent:"center", borderRadius:8
    },
    rowTitle:{
        flexDirection:"row", justifyContent:"space-between", alignItems:"center"
    },
    orderTitle:{color:COLORS.primary, fontSize:18, fontWeight:"500", marginBottom:5},
    subtitleOder:{fontSize:14, color:COLORS.textLight, marginBottom:10},
    cardInfo:{paddingHorizontal: 10, paddingVertical:20, backgroundColor:"white", marginTop:5, borderRadius:8},
    routeLine:{borderWidth:1, marginTop:5, borderBlockColor:"#ddd"},
    titleOrder:{fontSize:15, color:COLORS.text, fontWeight:"500", marginBottom:10},
    btn:{width:80 , borderColor:COLORS.primary, borderWidth:1, padding:3, justifyContent:"center", alignItems:"center", marginRight:10},
    rowBtn:{flexDirection:"row"}
});