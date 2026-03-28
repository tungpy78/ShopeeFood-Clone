import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import type { LoginRequest } from '../../types/auth.type';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../../types/api.type';

function LoginPage(){
  const navigate = useNavigate();

  const onFinish = async (values: LoginRequest) => {
    try {
      // Gọi API Login
      const response = await authService.login({
        phone: values.phone,
        password: values.password
      });


      // Nếu thành công (response.data chứa token và user)
      if (response && response.data) {
        // Lưu vào LocalStorage
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        message.success(response.message ?? "Đăng nhập thành công");
        
        // Chuyển hướng (Tạm thời về trang chủ, sau này mình chia Admin/User sau)
        navigate('/merchant-info');
      }
    } catch (error: unknown) {
      // Lỗi từ Axios Interceptor hoặc Backend trả về
      const err = error as AxiosError<ApiErrorResponse>;
      message.error(err.response?.data?.message ?? "Đăng nhập thất bại");
    }
  };

    return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card title="ShopeeFood Admin" style={{ width: 400 }} className="shadow-lg">
        <Form
          name="login"
          onFinish={onFinish}
          initialValues={{ remember: true }}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Số điện thoại" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block className="bg-orange-500 hover:bg-orange-600">
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage