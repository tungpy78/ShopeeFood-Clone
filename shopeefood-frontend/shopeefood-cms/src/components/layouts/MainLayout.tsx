import { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import HeaderLayout from './HeaderLayout';
import SidebarLayout from './SidebarLayout';
import { Header } from 'antd/es/layout/layout';

const { Content, Sider } = Layout;

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    // 'h-screen' giúp layout luôn chiếm full chiều cao trình duyệt
    <Layout className="h-screen overflow-hidden">
      
      {/* 1. SIDEBAR (Tràn từ trên xuống dưới) */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        theme="dark" // Hoặc light tùy em
        width={250}  // Độ rộng sidebar
      >
        <SidebarLayout />
      </Sider>

      {/* 2. KHỐI BÊN PHẢI (Gồm Header + Content) */}
      <Layout className="flex flex-col h-full">
        
        {/* Header nằm trong khối bên phải */}
        <Header style={{ background: "#fff"}} className="flex items-center w-full">
            <HeaderLayout collapsed={collapsed} setCollapsed={setCollapsed} />
        </Header>
        
        {/* Content tự động chiếm phần còn lại */}
        <Content className="m-4 p-6 bg-white rounded-lg shadow-sm overflow-y-auto">
          <Outlet />
        </Content>
        
      </Layout>
    </Layout>
  );
}

export default MainLayout;