import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { COLORS } from '../src/constants/theme';

export default function HistoryScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, color: COLORS.text }}>Đây là màn hình Lịch sử đơn hàng</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' }
});