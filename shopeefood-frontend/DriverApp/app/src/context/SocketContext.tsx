import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { driverService } from "../services/driver.service";
import { AxiosError } from "axios";
import { ApiErrorResponse } from "../types/api.types";
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, Vibration, View } from "react-native";
import { SocketContextType } from "../types/socket.types";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";

const SOCKET_URL = 'http://192.168.1.100:8080';

export const SocketContext = createContext<SocketContextType>({ 
    socket: null, 
    isOnline: false, 
    toggleOnline: async () => {},
    loadingToggle: false,
    orderUpdateTrigger:0
});

export const SocketProvider = ({children}: {children:React.ReactNode}) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isOnline, setIsOnline] = useState(false);
    const [loadingToggle, setLoadingToggle] = useState(false);

    const [incomingOrder, setIncomingOrder] = useState<any>(null);

    const [orderUpdateTrigger, setOrderUpdateTrigger] = useState(0);

    const { isAuthenticated, user } = useAuth();

    const handleToggleStatus = async () =>{
        setLoadingToggle(true);
        const newValue = !isOnline;
        try {
            await driverService.toggleStatus(newValue);
            setIsOnline(newValue);
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            Alert.alert("Lỗi",err.response?.data.message|| "Không thể đổi trạng thái lúc này");
        }finally{
            setLoadingToggle(false);
        }
    };

    useEffect(() => {
        if(!isAuthenticated || user?.status !== "ACTIVE" || !isOnline){
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('✅ Tài xế đã kết nối Socket. ID:', newSocket.id);
            // Báo cho backend biết tài xế này đang online (truyền ID tài xế lên)
            newSocket.emit('driver_online', user.id);
        })

        newSocket.on('job_available', (orderData) => {
            console.log("CÓ ĐƠN MỚI:", orderData);

            Vibration.vibrate([0, 500, 200, 500]);

            setIncomingOrder(orderData);
        });

        return () => {
            newSocket.disconnect();
        };

    },[isAuthenticated, isOnline, user?.status])

    const handleAcceptOrder = async (orderId: number) => {
        if (!incomingOrder) return;

        try {
            await driverService.acceptOrder(orderId);
            Alert.alert("Thành công", "Đã nhận đơn hàng! Hãy di chuyển đến quán.");

            socket?.emit('driver_busy');

            // 🔥 Nhận đơn xong thì tắt cái Popup đi
            setIncomingOrder(null); 
            
            setOrderUpdateTrigger(prev => prev + 1);
        } catch (error: any) {
            Alert.alert("Lỗi", "Nhận đơn thất bại. Có thể tài xế khác đã nhận!");
            setIncomingOrder(null); // Lỗi cũng tắt popup
        }
    };

    const handleRejectOrder = () => {
        // Tài xế bấm bỏ qua -> Chỉ việc tắt popup
        setIncomingOrder(null);
    };

    return (
        <SocketContext.Provider value={{ socket, isOnline, toggleOnline: handleToggleStatus, loadingToggle, orderUpdateTrigger }}>
            {children}
            <Modal
                visible={!!incomingOrder}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Ionicons name="notifications-circle" size={40} color={COLORS.primary}/>
                            <Text style={styles.modalTitle}>CÓ ĐƠN HÀNG MỚI!</Text>
                            <Text style={styles.timerText}>Vui lòng nhận đơn nhanh</Text>
                        </View>

                        <View style={styles.routeContainer}>
                            <View style={styles.routeItem}>
                                <Ionicons name="storefront" size={24} color="#E84A27"/>
                                <View style={styles.routeText}>
                                    <Text style={styles.placeName}>{incomingOrder?.merchant_info?.name}</Text>
                                    <Text style={styles.placeAddress}>{incomingOrder?.merchant_info?.address}</Text>
                                </View>
                            </View>

                            <View style={styles.routeLine} />

                            <View style={styles.routeItem}>
                                <Ionicons name="location" size={24} color="#00B14F" />
                                <View style={styles.routeText}>
                                    <Text style={styles.placeName}>{incomingOrder?.customer_info?.name}</Text>
                                    <Text style={styles.placeAddress}>{incomingOrder?.customer_info?.address}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.earningContainer}>
                            <Text style={styles.earningLabel}>Thu nhập dự kiến:</Text>
                            <Text style={styles.earningValue}>{incomingOrder?.earnings}</Text>
                        </View>

                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.rejectBtn} onPress={handleRejectOrder}>
                                <Text style={styles.rejectText}>Bỏ qua</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptOrder(incomingOrder?.id)}>
                                <Text style={styles.acceptText}>NHẬN ĐƠN</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>
        </SocketContext.Provider>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', 
        justifyContent: 'flex-end' // Đẩy popup xuống đáy màn hình (Bottom Sheet style)
    },
    modalContent: {
        backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 24, paddingBottom: 40,
        shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 10
    },
    modalHeader: { alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: '900', color: COLORS.text, marginTop: 10 },
    timerText: { fontSize: 14, color: COLORS.textLight, marginTop: 5 },
    routeContainer: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 16, marginBottom: 20 },
    routeItem: { flexDirection: 'row', alignItems: 'center' },
    routeText: { marginLeft: 15, flex: 1 },
    placeName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    placeAddress: { fontSize: 14, color: COLORS.textLight, marginTop: 2 },
    routeLine: { width: 2, height: 20, backgroundColor: '#ddd', marginLeft: 11, marginVertical: 5 },

    earningContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingHorizontal: 10 },
    earningLabel: { fontSize: 16, color: COLORS.textLight, fontWeight: '500' },
    earningValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },

    actionButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    rejectBtn: { flex: 1, paddingVertical: 16, alignItems: 'center', backgroundColor: '#f0f0f0', borderRadius: 12, marginRight: 10 },
    rejectText: { fontSize: 16, fontWeight: 'bold', color: COLORS.textLight },
    acceptBtn: { flex: 2, paddingVertical: 16, alignItems: 'center', backgroundColor: '#E84A27', borderRadius: 12 }, // Cam ShopeeFood
    acceptText: { fontSize: 18, fontWeight: '900', color: 'white' }
});

export const useSocket = () => useContext(SocketContext);