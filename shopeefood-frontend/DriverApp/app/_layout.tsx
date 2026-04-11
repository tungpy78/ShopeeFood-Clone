import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router'; 
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from './src/context/AuthContext'; 
import { SocketProvider } from './src/context/SocketContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

// ==========================================
// 1. TẠO COMPONENT BẢO VỆ ĐIỀU HƯỚNG
// ==========================================
function InitialLayout() {
  // 🔥 Lôi thêm biến user từ AuthContext ra để check trạng thái
  const { isAuthenticated, user, isLoading, logout } = useAuth(); 
  const segments = useSegments(); 
  const router = useRouter();
  const navigationState = useRootNavigationState();

  // 🔥 THÊM ĐOẠN NÀY ĐỂ LIÊN TỤC CANH ME LỖI TOKEN HẾT HẠN
  useEffect(() => {
      // Dùng một interval nhỏ để kiểm tra xem có cờ báo lỗi từ Axios không
      const checkTokenExpiration = setInterval(() => {
          if ((global as any).hasTokenExpired) {
              console.log("Bảo vệ phát hiện cờ hết hạn! Tiến hành đăng xuất...");
              (global as any).hasTokenExpired = false; // Hạ cờ xuống
              logout(); // Gọi hàm logout từ Context để reset state user về null
          }
      }, 1000); // Kiểm tra mỗi giây

      return () => clearInterval(checkTokenExpiration);
  }, [logout]);

  useEffect(() => {
    // Đợi Router khởi tạo xong và đợi đọc Token (isLoading) xong
    if (!navigationState?.key || isLoading) return;

    // Xem người dùng đang đứng ở nhóm màn hình nào
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

    setTimeout(() => {
      // TRƯỜNG HỢP 1: Chưa đăng nhập
      if (!isAuthenticated) {
        if (!inAuthGroup) { // Đang rình mò ở trang nội bộ -> Đuổi ra Login
            router.replace('/login');
        }
        return; // Dừng lại, không kiểm tra tiếp
      }

      // TRƯỜNG HỢP 2: Đã đăng nhập nhưng THIẾU HỒ SƠ (INCOMPLETE)
      if (user?.status === 'INCOMPLETE') {
          // Bắt buộc phải ở trang setup-profile
          if (segments[0] !== 'setup-profile') {
              router.replace('/setup-profile');
          }
          return; // Dừng lại
      }

      // TRƯỜNG HỢP 3: Đã đăng nhập và Hồ sơ đầy đủ (ACTIVE, PENDING_APPROVAL...)
      if (inAuthGroup || segments[0] === 'setup-profile') {
          // Nếu đang đứng lầm lũi ở Login hoặc Form Setup -> Đẩy vào Home
          router.replace('/');
      }

    }, 1);

  }, [isAuthenticated, user?.status, segments, navigationState?.key, isLoading]);

  return (
    <Stack>
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="order-detail" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      <Stack.Screen name="setup-profile" options={{ headerShown: false }} />
    </Stack>
  );
}

// ==========================================
// 2. ROOT LAYOUT BỌC BÊN NGOÀI (Giữ nguyên)
// ==========================================
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
        <SafeAreaProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AuthProvider>
              <SocketProvider>
                <InitialLayout />
              </SocketProvider>
            </AuthProvider>
            <StatusBar style="auto" />
          </ThemeProvider>
        </SafeAreaProvider>

  );
}