import { useEffect, useState } from 'react';
import { Tabs, Card, List, Button, Tag, Space, message, Divider, Popconfirm, Typography, Drawer, Descriptions } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, CarOutlined, SearchOutlined, FireOutlined, RocketOutlined, EyeOutlined } from '@ant-design/icons';
import { orderService } from '../../services/order.service';
import type { Order } from '../../types/order.type';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api.type';
import { useSocket } from '../../context/SocketContext';


const { Text } = Typography;

const OrderPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const { newOrderTrigger } = useSocket();

  // 1. Lấy TẤT CẢ đơn hàng khi vào trang
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.getMyOrders();
      // Giả sử API trả về res.data là mảng các đơn hàng
      setOrders(res.data);
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      message.error(err.response?.data.message ?? "Lỗi khi tải danh sách đơn hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [newOrderTrigger]);

  // 2. Hàm gọi API Cập nhật trạng thái
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      message.success(`Đã cập nhật đơn hàng thành: ${newStatus}`);
      fetchOrders(); // Load lại danh sách đơn để nó nhảy sang Tab khác
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      message.error(err.response?.data?.message ?? "Tải ảnh thất bại");
    }
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

// Hàm mở Drawer
const showDrawer = (order: Order) => {
  setSelectedOrder(order);
  setIsDrawerOpen(true);
};

// Hàm đóng Drawer
const onCloseDrawer = () => {
  setIsDrawerOpen(false);
  setSelectedOrder(null);
};

  // 3. Phân loại đơn hàng cho 3 Tabs bằng hàm Filter
  const pendingOrders = orders.filter(o => o.status === 'PENDING');
  const processingOrders = orders.filter(o => ['PREPARING', 'FINDING_DRIVER', 'DRIVER_PICKING', 'DELIVERING'].includes(o.status));
  const historyOrders = orders.filter(o => ['COMPLETED', 'CANCELLED'].includes(o.status));

  // Hàm render cái nhãn (Tag) trạng thái cho đẹp
  const renderStatusTag = (status: string) => {
  switch (status) {
    case 'PENDING': 
        return <Tag color="warning" icon={<ClockCircleOutlined />}>Mới đến</Tag>;
    case 'PREPARING': 
        return <Tag color="processing" icon={<FireOutlined />}>Đang nấu</Tag>;
    case 'FINDING_DRIVER': 
        return <Tag color="default" icon={<SearchOutlined />}>Đang tìm tài xế</Tag>;
    case 'DRIVER_PICKING': 
        return <Tag color="cyan" icon={<CarOutlined />}>Tài xế đang tới</Tag>;
    case 'DELIVERING': 
        return <Tag color="blue" icon={<RocketOutlined />}>Đang đi giao</Tag>;
    case 'COMPLETED': 
        return <Tag color="success" icon={<CheckCircleOutlined />}>Hoàn thành</Tag>;
    case 'CANCELLED': 
        return <Tag color="error" icon={<CloseCircleOutlined />}>Đã hủy</Tag>;
    default: 
        return <Tag>{status}</Tag>;
  }
};

  // Hàm Format tiền tệ
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // 4. Component dùng chung để vẽ từng Đơn hàng (Card)
  const renderOrderList = (data: Order[], isPendingTab: boolean = false) => (
    <List
      loading={loading}
      dataSource={data}
      renderItem={(order) => (
        <Card className="mb-4 shadow-sm" bodyStyle={{ padding: '16px 24px' }}>
          {/* Header của Đơn hàng */}
          <div className="flex justify-between items-center mb-2">
            <div>
              <Text strong className="text-lg">Mã đơn: #{order.id}</Text>
              <Text type="secondary" className="ml-4">
                {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : ''}
              </Text>
            </div>
            <Space>
              {renderStatusTag(order.status)}
              {/* 👇 THÊM NÚT NÀY VÀO ĐÂY 👇 */}
              <Button type="link" icon={<EyeOutlined />} onClick={() => showDrawer(order)}>
                Chi tiết
              </Button>
            </Space>
          </div>
          
          <Divider className="my-2" />

          {/* Danh sách món ăn trong Đơn */}
          <div className="my-4">
            {order.items && order.items.map((item) => (
              <div key={item.id} className="flex justify-between mb-1">
                <div className="flex items-center">
                  <img
                  src={item.food_info?.image}
                  className="w-10 h-10 rounded"
                  />

                  <Text>
                    <span className="font-bold text-blue-600 mr-2">
                      {item.quantity}x
                    </span>
                    {item.food_info?.name}
                  </Text>
                </div>
                <Text>{formatMoney(item.price * item.quantity)}</Text>
              </div>
            ))}
          </div>

          <Divider className="my-2" />

          {/* Footer: Tổng tiền và Nút Bấm */}
          <div className="flex justify-between items-center mt-2">
            <div>
              <Text className="mr-2">Tổng thu:</Text>
              <Text strong className="text-xl text-green-600">{formatMoney(order.final_price)}</Text>
            </div>
            
            {/* Nếu đang ở Tab Mới Đến (PENDING), mới hiện 2 nút Nhận/Hủy */}
            {isPendingTab && (
              <Space>
                <Popconfirm 
                  title="Bạn muốn từ chối đơn này?" 
                  onConfirm={() => handleUpdateStatus(order.id, 'CANCELLED')} 
                  okText="Từ chối" cancelText="Đóng" okButtonProps={{ danger: true }}
                >
                  <Button danger>Từ chối</Button>
                </Popconfirm>
                <Button type="primary" className="bg-green-500" onClick={() => handleUpdateStatus(order.id, 'PREPARING')}>
                  Nhận đơn & Làm món
                </Button>
              </Space>
            )}
          </div>
        </Card>
      )}
    />
  );

  // Khai báo 3 Tabs
  const tabItems = [
    {
      key: '1',
      label: `Mới đến (${pendingOrders.length})`,
      children: renderOrderList(pendingOrders, true), // Pass true để bật 2 nút thao tác
    },
    {
      key: '2',
      label: `Đang xử lý (${processingOrders.length})`,
      children: renderOrderList(processingOrders),
    },
    {
      key: '3',
      label: 'Lịch sử',
      children: renderOrderList(historyOrders),
    },
  ];

  return (
    <Card title="Quản Lý Đơn Hàng" className="min-h-screen">
      <Tabs defaultActiveKey="1" items={tabItems} size="large" />

      {/* 👇 GIAO DIỆN DRAWER CHI TIẾT ĐƠN HÀNG 👇 */}
      <Drawer
        title={`Chi tiết đơn hàng #${selectedOrder?.id || ''}`}
        placement="right"
        width={500} // Chiều rộng của thanh trượt
        onClose={onCloseDrawer}
        open={isDrawerOpen}
      >
        {selectedOrder && (
          <div className="flex flex-col gap-6">
            {/* Khung 1: Trạng thái thanh toán & Loại thanh toán */}
            <Descriptions title="Thông tin chung" column={1} bordered size="small">
              <Descriptions.Item label="Phương thức">
                <Tag color="geekblue">{selectedOrder.payment_method}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Giao đến">
                {selectedOrder.shipping_address}
              </Descriptions.Item>
            </Descriptions>

            {/* Khung 2: Thông tin Khách hàng (Giả sử DB có trả về customer_info) */}
            {selectedOrder.customer_info && (
              <Descriptions title="Khách hàng" column={1} size="small">
                <Descriptions.Item label="Tên khách">{selectedOrder.customer_info.full_name}</Descriptions.Item>
                <Descriptions.Item label="SĐT">{selectedOrder.customer_info.account?.phone}</Descriptions.Item>
              </Descriptions>
            )}

            {/* Khung 3: Danh sách món chi tiết */}
            <div>
              <Text strong className="text-base">Danh sách món ({selectedOrder.items?.length || 0})</Text>
              <List
                className="mt-2"
                itemLayout="horizontal"
                dataSource={selectedOrder.items}
                renderItem={(item) => (
                  <List.Item extra={<Text strong>{formatMoney(item.price * item.quantity)}</Text>}>
                    <List.Item.Meta
                      title={<Text><span className="text-blue-600 font-bold mr-2">{item.quantity}x</span> {item.food_info?.name || 'Tên món'}</Text>}
                      description={
                        item.options && item.options.length > 0 ? (
                          <ul className="pl-6 mt-1 mb-0 text-sm" style={{ listStyleType: 'circle', color: '#8c8c8c' }}>
                            {item.options.map((opt: any, index: number) => (
                              <li key={index}>
                                {opt.name} 
                                {/* Chỉ hiển thị giá tiền (+5.000 đ) nếu topping đó có tính phí */}
                                {opt.price > 0 && (
                                  <span className="ml-1 text-gray-500">(+{formatMoney(opt.price)})</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : null
                      }
                    />
                  </List.Item>
                )}
              />
            </div>

            {/* Khung 4: Hóa đơn tính tiền */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between mb-2">
                <Text type="secondary">Tạm tính (Món):</Text>
                <Text>{formatMoney(selectedOrder.total_price)}</Text>
              </div>
              <div className="flex justify-between mb-2">
                <Text type="secondary">Phí giao hàng:</Text>
                <Text>{formatMoney(selectedOrder.shipping_fee)}</Text>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between items-center">
                <Text strong className="text-lg">Tổng cộng:</Text>
                <Text strong className="text-xl text-green-600">{formatMoney(selectedOrder.final_price)}</Text>
              </div>
            </div>
            
            {/* Các nút thao tác (Nằm gọn bên dưới cùng của Drawer) */}
            {selectedOrder.status === 'PENDING' && (
              <Button type="primary" size="large" className="w-full bg-green-500" onClick={() => {
                 handleUpdateStatus(selectedOrder.id, 'PREPARING');
                 onCloseDrawer(); // Bấm xong thì tự đóng Drawer lại
              }}>
                Nhận Đơn Hàng Này
              </Button>
            )}
            
            {selectedOrder.status === 'PREPARING' && (
              <Button type="primary" size="large" className="w-full" onClick={() => {
                 handleUpdateStatus(selectedOrder.id, 'FINDING_DRIVER');
                 onCloseDrawer();
              }}>
                Đã Nấu Xong - Tìm Tài Xế
              </Button>
            )}
          </div>
        )}
      </Drawer>
    </Card>
  );
};

export default OrderPage;