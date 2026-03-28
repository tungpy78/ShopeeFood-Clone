import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, List, Avatar, Typography, Empty, message, Spin } from 'antd';
import { DollarOutlined, ShoppingCartOutlined, CloseCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DashboardData } from '../../types/merchant.type';
import type { AxiosError } from 'axios';
import { merchantService } from '../../services/merchant.service';
import type { ApiErrorResponse } from '../../types/api.type';
import { formatMoney } from '../../utils/formatMoney';

const { Title, Text } = Typography;

const DashboardPage = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Gọi đường dẫn API thống kê của em
      const res = await merchantService.getDashboardStats();
      setData(res.data); 
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
    message.error(err.response?.data?.message ?? "Lỗi khi tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spin size="large" /></div>;
  }

  if (!data) return null;

  return (
    <div className="p-4">   
      <Title level={3} className="mb-6">Tổng Quan Cửa Hàng</Title>

      {/* ========================================== */}
      {/* KHỐI 1: KPI CARDS (4 THẺ) */}
      {/* ========================================== */}
      <Row gutter={[16, 16]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-l-4 border-l-blue-500 rounded-lg">
            <Statistic
              title="Doanh Thu Hôm Nay"
              value={data.kpi.today_revenue}
              formatter={(val) => formatMoney(Number(val))}
              prefix={<DollarOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-l-4 border-l-green-500 rounded-lg">
            <Statistic
              title="Đơn Thành Công (Hôm nay)"
              value={data.kpi.today_completed}
              prefix={<ShoppingCartOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-l-4 border-l-red-500 rounded-lg">
            <Statistic
              title="Đơn Hủy (Hôm nay)"
              value={data.kpi.today_cancelled}
              prefix={<CloseCircleOutlined className="text-red-500" />}
              valueStyle={{ color: '#f5222d', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm border-l-4 border-l-purple-500 rounded-lg bg-purple-50">
            <Statistic
              title="TỔNG DOANH THU (ALL TIME)"
              value={data.kpi.total_revenue}
              formatter={(val) => formatMoney(Number(val))}
              prefix={<TrophyOutlined className="text-purple-500" />}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* ========================================== */}
      {/* KHỐI 2 & 3: BIỂU ĐỒ & TOP MÓN ĂN */}
      {/* ========================================== */}
      <Row gutter={[16, 16]}>
        {/* Cột Trái: Biểu đồ (Chiếm 2/3 màn hình trên Desktop) */}
        <Col xs={24} lg={16}>
          <Card title="Biểu Đồ Doanh Thu (7 Ngày Qua)" className="shadow-sm h-full">
            {data.chart && data.chart.length > 0 ? (
              <div className='h-88'>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.chart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis 
                      tickFormatter={(value) => `${value / 1000}k`} // Format trục Y cho gọn (ví dụ 30000 -> 30k)
                      width={60}
                    />
                    <Tooltip 
                      formatter={(value: any) => [formatMoney(value), 'Doanh thu']}
                      labelFormatter={(label) => `Ngày: ${label}`}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#1890ff" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              // XỬ LÝ TRƯỜNG HỢP MẢNG CHART RỖNG
              <div className="flex justify-center items-center h-full min-h-87.5">
                <Empty description={<span className="text-gray-400">Chưa có dữ liệu doanh thu trong 7 ngày qua</span>} />
              </div>
            )}
          </Card>
        </Col>

        {/* Cột Phải: Top 5 món ăn (Chiếm 1/3 màn hình trên Desktop) */}
        <Col xs={24} lg={8}>
          <Card title="Top 5 Món Bán Chạy Nhất" className="shadow-sm h-full">
            {data.top_foods && data.top_foods.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={data.top_foods}
                renderItem={(item, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={item.food_info.image} size="large" shape="square" />}
                      title={
                        <Text strong>
                          {/* Hiển thị Top 1, 2, 3 bằng màu sắc khác nhau */}
                          <span className={`mr-2 ${index === 0 ? 'text-yellow-500 text-lg' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-400' : 'text-gray-800'}`}>
                            #{index + 1}
                          </span> 
                          {item.food_info.name}
                        </Text>
                      }
                      description={<Text type="secondary">Đã bán: <span className="text-blue-600 font-bold">{item.total_sold}</span> phần</Text>}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có món nào được bán" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;