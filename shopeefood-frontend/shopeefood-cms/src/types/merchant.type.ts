export interface CreateMerchantRequest {
    name: string;
    address: string;
    phone: string;
    latitude: number;
    longitude: number;
    cover_image: string;
}

// Định nghĩa Type dựa trên JSON Backend của em
export interface DashboardData {
  kpi: {
    today_revenue: number;
    today_completed: number;
    today_cancelled: number;
    total_revenue: number;
  };
  chart: { date: string; revenue: number }[];
  top_foods: {
    food_id: number;
    total_sold: string;
    food_info: { name: string; image: string };
  }[];
}