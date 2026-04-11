import axios from 'axios';
// THÊM DÒNG NÀY: Import AsyncStorage để lấy token
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { Alert } from 'react-native';

// 🛑 THAY BẰNG IP IPv4 CỦA MÁY TÍNH EM (Nhớ giữ nguyên http:// và /api)
const BASE_URL = 'http://192.168.1.100:8080/api/v1'; 

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, 
});

// ==========================================
// 1. REQUEST INTERCEPTOR (THÊM ĐOẠN NÀY VÀO)
// ==========================================
axiosClient.interceptors.request.use(
  async (config) => {
    try {
      // Moi Token từ trong điện thoại ra
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        // Nếu có token, nhét nó vào Header gửi đi
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Lỗi khi lấy token từ AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// 2. RESPONSE INTERCEPTOR (SỬA Ở ĐÂY ĐỂ BẮT LỖI 401)
// ==========================================
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    // KHI TOKEN HẾT HẠN HOẶC KHÔNG HỢP LỆ (LỖI 401)
    if (error.response && error.response.status === 401) {
        console.log("Phát hiện Token hết hạn (Lỗi 401)!");
        
        try {
            // 1. Xóa sạch dữ liệu trong kho chứa
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('userInfo');
            
            // 2. Hiển thị thông báo cho người dùng
            Alert.alert(
                "Phiên đăng nhập hết hạn",
                "Vui lòng đăng nhập lại để tiếp tục sử dụng ứng dụng.",
                [
                    {
                        text: "Đồng ý",
                        // Mẹo: Vì file này không gọi được lệnh router.replace() của Expo,
                        // ta sẽ lợi dụng sự kiện khởi động lại app để hệ thống tự đá về Login.
                        // (Hoặc tí nữa thầy sẽ chỉ em cách gắn router vào ngoài context)
                    }
                ]
            );

            // MẸO CAO CẤP: Gắn một biến global để báo hiệu cho App biết cần reload
            // (Chúng ta sẽ dùng biến này bên InitialLayout để tự động logout)
            (global as any).hasTokenExpired = true;

        } catch (e) {
            console.log("Lỗi khi xóa token:", e);
        }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;