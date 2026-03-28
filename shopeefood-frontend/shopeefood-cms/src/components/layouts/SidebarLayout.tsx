import { AppstoreOutlined, DashboardOutlined, OrderedListOutlined, ShopOutlined } from "@ant-design/icons";
import { Menu } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { merchantService } from "../../services/merchant.service";

function SidebarLayout() {
  const navigate = useNavigate();
    const [merchantStatus, setMerchantStatus] = useState<string>(''); // Lưu trạng thái quán

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await merchantService.getProfile();
        if (response && response.data) {
          setMerchantStatus(response.data.status); // Lưu trạng thái quán
        }
      } catch (error) {
        // Xử lý lỗi nếu cần
        console.error("Error fetching merchant profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const isPending = merchantStatus === "PENDING_APPROVAL";

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
      disabled: isPending,
    },
    {
      key: "/orders",
      icon: <OrderedListOutlined />,
      label: "Quản lý đơn hàng",
      disabled: isPending,
    },
    {
      key: "/merchant-info",
      icon: <ShopOutlined />,
      label: "Thông tin quán",
    },
    {
      key: "menu",
      icon: <AppstoreOutlined />,
      label: "Quản lý thực đơn",
      children: [
        {
          key: "/menu/categories",
          label: "Danh mục",
          disabled: isPending,
        },
        {
          key: "/menu/foods",
          label: "Món ăn",
          disabled: isPending,
        },
        {
          key: "/menu/optionGroup",
          label: "Lựa chọn thêm",
          disabled: isPending,
        },
      ],
    },
  ];

  return (
    <>
      <div className="demo-logo-vertical" />
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["/dashboard"]}
        items={menuItems}
        onClick={({ key }) => {
          navigate(key);
        }}
      />
    </>
  );
}

export default SidebarLayout;