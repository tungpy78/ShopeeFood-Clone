import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { formatMoney } from "../src/utils/format";
import { COLORS } from "../src/constants/theme";
import { useCallback, useState } from "react";
import { driverService } from "../src/services/driver.service";
import { Wallet } from "../src/types/wallet.types";

export default function WalletScreen() {

    const [walletData, setWalletData] = useState<Wallet | null>(null);
    const [loading, setLoading] = useState(true);

    // 🔥 Gọi API lấy dữ liệu Ví mỗi khi màn hình này được bật lên
    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const fetchWallet = async () => {
                setLoading(true);
                try {
                    const res = await driverService.getWalletInfo();
                    if (isActive) {
                        setWalletData(res.data);
                    }
                } catch (error) {
                    console.log("Lỗi tải ví:", error);
                    Alert.alert("Lỗi", "Không thể tải dữ liệu ví");
                } finally {
                    if (isActive) setLoading(false);
                }
            };

            fetchWallet();
            return () => { isActive = false; };
        }, [])
    );

    const handleDeposit = () => {
        Alert.alert("Nạp tiền", "Tính năng kết nối cổng thanh toán (VNPay/Momo) đang phát triển.");
    }

    const handleWithdraw = () => {
        Alert.alert("Rút tiền", "Yêu cầu rút tiền về tài khoản ngân hàng.");
    }

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerBackground}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={{padding:5}}>
                        <Ionicons name="arrow-back" size={28} color="white"/>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Ví của tôi</Text>
                    <TouchableOpacity style={{padding:5}}>
                        <Ionicons name="settings-outline" size={28} color="white"/>
                    </TouchableOpacity>
                </View>

                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceLabel}>Tài khoản chính</Text>
                    {/* 🔥 HIỂN THỊ SỐ DƯ THẬT TỪ API */}
                    <Text style={styles.balanceValue}>{formatMoney(Number(walletData?.balance))}</Text>
                </View>
            </View>

            <View style={styles.actionCard}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleDeposit}>
                    <Ionicons name="wallet" size={28} color={COLORS.primary} />
                    <Text style={styles.actionText}>Nạp tiền</Text>
                </TouchableOpacity>
                <View style={styles.dividerVertical} />
                <TouchableOpacity style={styles.actionBtn} onPress={handleWithdraw}>
                    <Ionicons name="cash" size={28} color={COLORS.primary} />
                    <Text style={styles.actionText}>Rút tiền</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.menuContainer}>
                <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/revenue')}>
                    <Ionicons name="bar-chart-outline" size={22} color={COLORS.primary} />
                    <Text style={[styles.menuTitle, { marginLeft: 10 }]}>Báo cáo thu nhập (Chi tiết)</Text>
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </TouchableOpacity>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
                </View>

                {walletData?.transactions?.length === 0 ? (
                    <Text style={styles.emptyText}>Chưa có giao dịch nào.</Text>
                ) : (
                    walletData?.transactions?.map((tx) => {
                        const isPositive = Number(tx.amount) > 0;
                        return (
                            <View key={tx.id} style={styles.txItem}>
                                <View style={styles.txLeft}>
                                    <View style={[styles.txIconBox, { backgroundColor: isPositive ? '#e6f7ec' : '#fceaea' }]}>
                                        <Ionicons 
                                            name={isPositive ? "arrow-down" : "arrow-up"} 
                                            size={20} 
                                            color={isPositive ? "#00B14F" : "#dc3545"} 
                                        />
                                    </View>
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
                                        <Text style={styles.txDate}>
                                            {/* Format ngày giờ */}
                                            {new Date(tx.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={[styles.txAmount, { color: isPositive ? "#00B14F" : "#dc3545" }]}>
                                    {isPositive ? '+' : ''}{formatMoney(Number(tx.amount))}
                                </Text>
                            </View>
                        );
                    })
                )}
                
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
   container:{flex:1, backgroundColor:"#f5f5f5"},
   headerBackground:{backgroundColor:COLORS.primary, paddingHorizontal:10, paddingVertical:50, borderBottomLeftRadius:15, borderBottomRightRadius:15},
    headerTop:{flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:10},
    headerTitle:{fontSize:18, fontWeight:500, color:"white"},
    balanceContainer:{alignItems:"center"},
    balanceLabel:{color: "#ddd", fontSize:13, marginBottom:10},
    balanceValue:{color:"white", fontSize:36, fontWeight:"bold"},
    actionCard:{flexDirection:"row", backgroundColor: 'white', marginHorizontal: 20, marginTop: -30, borderRadius: 12, paddingVertical: 15, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4
    },
    dividerVertical: { width: 1, backgroundColor: '#eee', marginVertical: 5 },
    actionBtn:{flex: 1, alignItems: 'center', justifyContent: 'center'},
    actionText:{marginTop: 8, fontSize: 15, color: COLORS.text, fontWeight: '500' },
    menuContainer:{marginTop: 20, backgroundColor: 'white', flex: 1},
    menuItem:{flexDirection:"row", alignItems:"center", paddingVertical: 18, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0'},
    menuTitle: { fontSize: 16, color: COLORS.text, fontWeight: '500', flex: 1 },

    sectionHeader:{backgroundColor:"#f5f5f5", paddingHorizontal: 20, paddingVertical: 15},
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
    emptyText: { textAlign: 'center', color: COLORS.textLight, marginTop: 20, fontStyle: 'italic' },
    
    txItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    txLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    txIconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    txDesc: { fontSize: 15, fontWeight: '500', color: COLORS.text, width: 220 },
    txDate: { fontSize: 13, color: COLORS.textLight, marginTop: 4 },
    txAmount: { fontSize: 16, fontWeight: 'bold' },
});
