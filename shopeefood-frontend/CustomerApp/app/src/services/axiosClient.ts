import axios from 'axios';
// THÊM DÒNG NÀY: Import AsyncStorage để lấy token
import AsyncStorage from '@react-native-async-storage/async-storage'; 

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
// 2. RESPONSE INTERCEPTOR (Giữ nguyên của em)
// ==========================================
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;