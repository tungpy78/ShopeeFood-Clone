import { useRoutes, Navigate, Outlet } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import MainLayout from '../components/layouts/MainLayout';
import MerchantProfilePage from '../pages/merchant/MerchantProfilePage';
import CategoryPage from '../pages/menu/CategoryPage';
import FoodPage from '../pages/menu/FoodPage';
import OrderPage from '../pages/merchant/OrderPage';
import DashboardPage from '../pages/merchant/DashboardPage';
import OptionGroupPage from '../pages/menu/OptionGroupPage';
// Import các trang khác sau này...

// 1. Component bảo vệ (Guard): Kiểm tra xem đã đăng nhập chưa
const ProtectedRoute = () => {
  const token = localStorage.getItem('accessToken');
  // Nếu không có token -> Đá về login
  return token ? <Outlet /> : <Navigate to="/login" />;
};

// 2. Component từ chối (Rejected): Đã đăng nhập rồi thì không cho vào trang Login nữa
const RejectedRoute = () => {
  const token = localStorage.getItem('accessToken');
  // Nếu có token -> Đá về Dashboard (hoặc trang chủ)
  return !token ? <Outlet /> : <Navigate to="/dashboard" />;
};

export default function useRouteElements() {
  const routeElements = useRoutes([
    // --- VÙNG PUBLIC (Ai cũng vào được hoặc vùng Auth) ---
    {
      path: '',
      element: <RejectedRoute />, // Đã login thì không cho vào đây nữa
      children: [
        {
          path: 'login',
          element: <LoginPage />
        },
        // Sau này thêm register ở đây
      ]
    },

    // --- VÙNG PRIVATE (Phải đăng nhập mới xem được) ---
    {
      path: '',
      element: <ProtectedRoute />,
      children: [
        // BỌC MAIN LAYOUT Ở ĐÂY
        {
            path: '',
            element: <MainLayout />, // Layout bao bọc các trang con
            children: [
                {
                    path: 'dashboard',
                    element: <DashboardPage />
                },
                {
                    path: 'orders',
                    element: <OrderPage />
                },
                {
                  path: 'merchant-info',
                  element: <MerchantProfilePage />
                },
                {
                  path: 'menu/categories',
                  element: <CategoryPage />
                },
                {
                  path: 'menu/foods',
                  element: <FoodPage />
                },
                {
                  path: '/menu/optionGroup',
                  element:<OptionGroupPage />
                }
            ]
        }
      ]
    },
    { path: '*', element: <div>404 Not Found</div> }
  ]);

  return routeElements;
}