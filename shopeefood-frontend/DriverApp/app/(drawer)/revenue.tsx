import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ChartData, Revenue } from "../src/types/revenue.types";
import { router, useFocusEffect } from "expo-router";
import { driverService } from "../src/services/driver.service";
import { COLORS } from "../src/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { formatMoney } from "../src/utils/format";

export default function RevenueScreen() {
    const [revenueData, setRevenueData] = useState<Revenue | null>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const fetchRevenue = async () => {
                setLoading(true);
                try {
                    const res = await driverService.getRevenueChart();
                    if (isActive) {
                        setRevenueData(res.data);
                    }
                } catch (error) {
                    console.log("Lỗi tải doanh thu:", error);
                    Alert.alert("Lỗi", "Không thể tải dữ liệu biểu đồ");
                }finally{
                    if(isActive) setLoading(false);
                }
            }

            fetchRevenue();

            return () => {isActive = false};

        },[])
    );

    if(loading){
        return(
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        )
    }

    const maxRevenue = revenueData?.chart_data.reduce((max:number, item: ChartData) => Math.max(max, item.revenue), 0) || 1;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerTop}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
                    <Ionicons name="arrow-back-outline" size={28} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Thu nhập</Text>
                <TouchableOpacity style={{ padding: 5 }}>
                    <Ionicons name="information-circle-outline" size={26} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}> 
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Tổng thu nhập 7 ngày qua</Text>
                    <Text style={styles.summaryValue}>{formatMoney(Number(revenueData?.total_revenue))}</Text>
                </View>

                <View style={styles.chartContainer}>
                    {revenueData?.chart_data.map((item, index) => {
                        let heightPercent = (item.revenue / maxRevenue) * 100;
                        if(item.revenue > 5 && heightPercent < 5) heightPercent=5;
                        const isZero = item.revenue === 0;
                        return(
                            <View key={index} style={styles.barWrapper}>
                                <Text style={[styles.barValueText, { color: isZero ? '#999' : '#0084FF' }]}>
                                    {isZero ? '0đ' : `${item.revenue / 1000}K`}
                                </Text>

                                <View style={styles.barBackground}>
                                    <View style={[
                                        styles.barFill, 
                                        { 
                                            height: `${heightPercent}%`,
                                            backgroundColor: isZero ? '#eee' : '#0084FF' 
                                        }
                                    ]} />
                                </View>

                                <Text style={styles.barLabelText}>{item.label}</Text>

                            </View>
                        )
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container:{flex:1, backgroundColor:"#f0f2f5"},
    headerTop:{flexDirection:"row", justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 40, paddingBottom: 15, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle:{fontSize:18, fontWeight:"bold"},

    summaryBox:{alignItems:"center", padding:20, backgroundColor:"#fff7e6", borderBottomWidth: 1, borderBottomColor: '#eee'},
    summaryLabel: { fontSize: 15, color: COLORS.text },
    summaryValue: { fontSize: 28, fontWeight: 'bold', color: COLORS.primary, marginTop: 5 },
    
    chartContainer:{
        flexDirection: 'row',
        justifyContent:"space-between",
        alignItems: 'flex-end',
        height:200
    },
    barWrapper:{alignItems:"center", width: 40,},
    barValueText: { fontSize: 12, fontWeight: '500', marginBottom: 5 },
    barBackground:{
        height:120,
        width:30,
        justifyContent: 'flex-end'
    },
    barFill: { 
        width: '100%', 
        borderTopLeftRadius: 3, 
        borderTopRightRadius: 3 
    },
    barLabelText: { fontSize: 11, color: COLORS.textLight, textAlign: 'center', marginTop: 10, lineHeight: 16 },
});