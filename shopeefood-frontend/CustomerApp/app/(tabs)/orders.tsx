import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../src/constants/theme';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { OrderHistory } from '../src/types/customer.types';
import { orderService } from '../src/services/order.service';
import { formatMoney } from '../src/utils/format';
import { useSocket } from '../src/context/SocketContext';
export default function OrdersScreen() {
  const { isAuthenticated,user } = useAuth();
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ONGOING' | 'HISTORY'>('ONGOING');

  const { orderUpdateTrigger } = useSocket();

  const fetchOrders = async () => {
    if(!isAuthenticated){
      setLoading(false);
      return;
    }
    try {
      const res = await orderService.getMyOrders();
      setOrders(res.data || []);
    } catch (error) {
      console.log("Lỗi tải đơn hàng:", error);
    }finally {
        setLoading(false);
        setRefreshing(false);
    }
  }

  // Lắng nghe biến orderUpdateTrigger, hễ nó đổi (có thông báo mới) là gọi lại API
    React.useEffect(() => {
        fetchOrders();
    }, [isAuthenticated, orderUpdateTrigger]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    },[isAuthenticated])
  );

  const onRefresh = () => {
      setRefreshing(true);
      fetchOrders();
  };

  const ongoingOrders = orders.filter(o => ['PENDING', 'PREPARING', 'FINDING_DRIVER', 'DRIVER_PICKING', 'DELIVERING'].includes(o.status));
  const historyOrders = orders.filter(o => ['COMPLETED', 'CANCELLED'].includes(o.status));

  const displayOrders = activeTab === 'ONGOING' ? ongoingOrders : historyOrders;

  const getStatusLable = (status: string) => {
    switch(status){
      case 'PENDING': return {text: 'Chờ nhận đơn', color:'#ff9800', bgColor:'#fff3e0', icon: 'time-outline'};
     case 'PREPARING': return { text: 'Quán đang làm', color: '#2196f3', bgColor: '#e3f2fd', icon: 'restaurant-outline' };
      case 'FINDING_DRIVER': return { text: 'Tìm tài xế', color: '#9c27b0', bgColor: '#f3e5f5', icon: 'search-outline' };
      case 'DRIVER_PICKING': return { text: 'Tài xế đang tới lấy', color: '#00bcd4', bgColor: '#e0f7fa', icon: 'bicycle-outline' };
      case 'DELIVERING': return { text: 'Đang giao hàng', color: '#3f51b5', bgColor: '#e8eaf6', icon: 'map-outline' };
      case 'COMPLETED': return { text: 'Hoàn thành', color: '#4caf50', bgColor: '#e8f5e9', icon: 'checkmark-circle-outline' };
      case 'CANCELLED': return { text: 'Đã hủy', color: '#f44336', bgColor: '#ffebee', icon: 'close-circle-outline' };
      default: return { text: status, color: '#757575', bgColor: '#f5f5f5', icon: 'help-circle-outline' };
    }
  }

  if (!isAuthenticated) {
    return (
        <View style={styles.centerContainer}>
            <Ionicons name="receipt-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>Bạn cần đăng nhập để xem đơn hàng</Text>
        </View>
    );
  }

  const renderOrderItem = ({ item }: { item: OrderHistory }) => {
    const statusObj = getStatusLable(item.status);
    const merchantName = item.merchant_info.name;

    return(
      <TouchableOpacity
      style={styles.orderCard}
      activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.merchantName} numberOfLines={1}>{merchantName}</Text>
          <View style={[styles.statusBadge, {backgroundColor:statusObj.bgColor}]}>
            <Ionicons name={statusObj.icon as any} size={14} color={statusObj.color}/>
            <Text style={[styles.statusText, { color: statusObj.color }]} >{statusObj.text}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.itemCount}>{item.items.length || 0} món</Text>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.totalPriceLabel}>Tổng tiền:</Text>
          <Text style={styles.totalPrice}>{formatMoney(item.final_price)}</Text>
        </View>

      </TouchableOpacity>
    );
  };

  return(
    <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'ONGOING' && styles.activeTab]}
            onPress={() => setActiveTab('ONGOING')}
          >
            <Text style={[styles.tabText, activeTab === 'ONGOING' && styles.activeTabText]}>
              Đang đến ({ongoingOrders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'HISTORY' && styles.activeTab]}
              onPress={() => setActiveTab('HISTORY')}
          >
              <Text style={[styles.tabText, activeTab === 'HISTORY' && styles.activeTabText]}>
                  Lịch sử ({historyOrders.length})
              </Text>
          </TouchableOpacity>

        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}} />
        ) : (
          <FlatList 
            data={displayOrders}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderOrderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                  <Ionicons name="fast-food-outline" size={60} color="#ccc" />
                  <Text style={styles.emptyText}>Chưa có đơn hàng nào ở đây cả!</Text>
              </View>
            }
          />
        )}

    </View>
  )
}

const styles = StyleSheet.create({
  container:{flex:1, backgroundColor:"#f5f5f5"},
  header:{alignItems:"center", paddingBottom:15, paddingTop:50, borderBottomWidth:1, borderColor:"#eee", backgroundColor: 'white'},
  headerTitle:{fontSize:18, fontWeight:"bold"},
  tabContainer:{flexDirection:"row", backgroundColor:"white", paddingHorizontal:15, paddingVertical:10,marginBottom:10},
  tabButton:{flex:1, paddingVertical:10, alignItems:"center", borderBottomWidth: 2, borderBottomColor: 'transparent'},
  activeTab: { borderBottomColor: COLORS.primary },
  tabText:{fontSize:15, fontWeight:"500", color:COLORS.textLight},
  activeTabText:{color:COLORS.primary, fontWeight: 'bold'},
  listContainer:{padding:15, paddingBottom:100},
  orderCard:{backgroundColor:"white", padding:15, marginBottom:25, borderRadius:12,shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2},
  cardHeader:{flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:10},
  merchantName:{fontSize:16, fontWeight:"bold",color: COLORS.text, flex: 1, marginRight: 10},
  statusBadge:{flexDirection:"row", alignItems:"center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20},
  statusText:{fontSize:12, fontWeight:"bold",marginLeft: 4},
  cardBody:{flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:20},
  itemCount:{fontSize: 14, color:COLORS.text},
  orderDate:{fontSize: 13, color:COLORS.textLight},
  cardFooter:{flexDirection:"row", justifyContent:"space-between", alignItems:"center", borderTopWidth:1, borderColor:"#f0f0f0", paddingTop:20},
  totalPriceLabel:{fontSize: 14, color: COLORS.textLight, fontWeight: '500'},
  totalPrice:{color:COLORS.primary, fontWeight:"bold", fontSize: 18},
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, fontSize: 15, color: COLORS.textLight }
})