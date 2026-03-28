import axios from 'axios';

// 🛑 THAY BẰNG IP IPv4 CỦA MÁY TÍNH EM (Nhớ giữ nguyên http:// và /api)
// Ví dụ: http://192.168.1.10:3000/api
// const BASE_URL = 'http://192.168.1.100:8080/api/v1'; 
const BASE_URL = 'http://10.251.8.191:8080/api/v1'; 

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, 
});

// Response Interceptor: Trả về data luôn giống hệt Web
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Ở giai đoạn này của App, ta tạm thời chỉ bắn lỗi ra để UI tự xử lý bằng Alert
    // (Vụ AsyncStorage lưu Token và tự động văng ra màn Login ta sẽ setup ở Giai đoạn sau khi làm phần Đăng nhập Khách hàng)
    return Promise.reject(error);
  }
);

export default axiosClient;