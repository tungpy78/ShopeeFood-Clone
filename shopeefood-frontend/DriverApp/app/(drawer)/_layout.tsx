import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, Text, Image, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useSocket } from '../src/context/SocketContext';
import { COLORS } from '../src/constants/theme';

// ==========================================
// COMPONENT: GIAO DIỆN BÊN TRONG MENU TRƯỢT
// ==========================================
function CustomDrawerContent(props: any) {
    const { user, logout } = useAuth();
    const { isOnline, toggleOnline, loadingToggle } = useSocket();

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
                {/* 1. Header: Avatar & Tên */}
                <View style={styles.drawerHeader}>
                    <Image source={{ uri: user?.avatar }} style={styles.avatar} />
                    <Text style={styles.userName}>{user?.full_name}</Text>
                    <Text style={styles.userId}>ID: {user?.id} - Shipper</Text>
                </View>

                {/* 2. Công tắc Trạng thái hoạt động */}
                <View style={styles.statusRow}>
                    <Text style={styles.statusText}>Trạng thái hoạt động</Text>
                    <Switch
                        trackColor={{ false: "#767577", true: COLORS.primary }}
                        thumbColor={"#f4f3f4"}
                        value={isOnline}
                        onValueChange={toggleOnline}
                        disabled={loadingToggle}
                    />
                </View>

                <View style={styles.divider} />

                {/* 3. Danh sách các trang (Tự động render theo khai báo bên dưới) */}
                <View style={{ paddingVertical: 10 }}>
                    <DrawerItemList {...props} />
                </View>
                
                <View style={styles.divider} />

                {/* 4. Nút Đăng xuất */}
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <Ionicons name="log-out-outline" size={24} color="#dc3545" />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </TouchableOpacity>

            </DrawerContentScrollView>
        </View>
    );
}

// ==========================================
// CẤU HÌNH DRAWER
// ==========================================
export default function DrawerLayout() {
    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: false, // Ẩn cái header mặc định xấu xí đi
                drawerActiveBackgroundColor: '#fee8e5',
                drawerActiveTintColor: COLORS.primary,
                drawerInactiveTintColor: '#333',
                drawerLabelStyle: { fontSize: 16, fontWeight: '500', marginLeft: -15 },
            }}
        >
            {/* CÁC MỤC TRONG MENU */}
            <Drawer.Screen
                name="index" // Trỏ vào file app/(drawer)/index.tsx
                options={{
                    drawerLabel: 'Trang chủ',
                    drawerIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} 
                    style={{marginRight:10}}
                    />,
                }}
            />
            <Drawer.Screen
                name="wallet" // Trỏ vào file app/(drawer)/wallet.tsx
                options={{
                    drawerLabel: 'Thu nhập & Ví',
                    drawerIcon: ({ color }) => <Ionicons name="wallet-outline" size={24} color={color} 
                    style={{marginRight:10}}/>,
                }}
            />
            <Drawer.Screen
                name="history" // Trỏ vào file app/(drawer)/history.tsx
                options={{
                    drawerLabel: 'Lịch sử đơn hàng',
                    drawerIcon: ({ color }) => <Ionicons name="receipt-outline" size={24} color={color}
                    style={{marginRight:10}} />,
                }}
            />
        </Drawer>
    );
}

const styles = StyleSheet.create({
    drawerHeader: { padding: 20, paddingTop: 60, backgroundColor: '#f9f9f9', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
    avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10, borderWidth: 2, borderColor: COLORS.primary },
    userName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    userId: { fontSize: 14, color: COLORS.textLight, marginTop: 5 },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
    statusText: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
    divider: { height: 1, backgroundColor: '#eee', marginHorizontal: 20 },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', padding: 20, marginTop: 10 },
    logoutText: { fontSize: 16, fontWeight: 'bold', color: '#dc3545', marginLeft: 15 }
});