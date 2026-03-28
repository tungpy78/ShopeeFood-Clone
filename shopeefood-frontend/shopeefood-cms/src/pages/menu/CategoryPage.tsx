import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message, Modal, Popconfirm, Space, Table } from "antd";
import { useEffect, useState } from "react";
import type { Category } from "../../types/category.type";
import { useForm } from "antd/es/form/Form";
import { CategoryService } from "../../services/category.service";
import type { AxiosError } from "axios";
import type { ApiErrorResponse } from "../../types/api.type";

function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Quản lý trạng thái của Modal (Popup Thêm/Sửa)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [form] = useForm();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await CategoryService.getAll();
      if(res && res.data){
        setCategories(res.data)
      }
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      message.error(err.response?.data.message ?? "Lấy danh mục thất bại");
    }finally{
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchCategories();
  },[])

  const handleAdd = () => {
    setEditingCategory(null); // Xóa trạng thái đang sửa (nếu có)
    form.resetFields(); // Làm sạch form
    setIsModalVisible(true); // Mở Modal lên
  }

  const handleEdit = (record: Category) => {
    setEditingCategory(record); // Lưu lại thông tin danh mục đang sửa
    form.setFieldsValue(record); // Đổ dữ liệu cũ vào form
    setIsModalVisible(true); // Mở Modal lên
  }

  // 4. Hàm xử lý khi bấm "Xác nhận xóa"
  const handleDelete = async (id: number) => {
    try {
      const res = await CategoryService.delete(id);
      if(res && res.status === 200){
        message.success(res.message ?? 'Xóa thành công!');
      }
      fetchCategories(); // Load lại bảng
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      message.error(err.response?.data?.message ?? "Xóa thất bại");
    }
  };

  const handleOk = async () => {
    try {
      // Bắt buộc form phải điền đúng validate mới chạy tiếp
      const values = await form.validateFields();
      
      if (editingCategory) {
          // CÓ HỨNG RES LẠI ĐỂ LẤY MESSAGE
          const res = await CategoryService.update(editingCategory.id, values);
          // Dùng cú pháp ?? (Nullish coalescing)
          // Nếu res.message từ backend có chữ, nó lấy chữ đó. Nếu rỗng/undefined, nó lấy chữ cứng.
          message.success(res.message ?? 'Cập nhật danh mục thành công!');
      } else {
          const res = await CategoryService.create(values);
          message.success(res.message ?? 'Thêm danh mục mới thành công!');
      }
      
      setIsModalVisible(false); // Đóng Modal
      fetchCategories(); // Load lại bảng để thấy dữ liệu mới
    } catch (error: any) {
      // Nếu lỗi validate sẽ vào catch này, nên mình kiểm tra nếu error có thuộc tính errorFields (đặc trưng của lỗi validate) thì sẽ không hiện message lỗi API
      if (!error.errorFields) {
        const err = error as AxiosError<ApiErrorResponse>;
        message.error(err.response?.data?.message ?? "Thao tác thất bại");
      }
    }
  };




  const colomns =[
    {
      title:'ID',
      dataIndex: 'id',
      key: 'id',
      width: '80px'
    },
    {
      title: "Tên Danh Mục",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Hành Động",
      key: "action",
      width: '150px',
      render: (_: any, record: Category) => (
        <Space size="middle">
          {/* Nút Sửa */}
          <Button 
            type="text" 
            icon={<EditOutlined style={{ color: '#1890ff' }} />} 
            onClick={() => handleEdit(record)} 
          />
          {/* Nút Xóa (Có bọc hỏi chấm xác nhận) */}
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            description="Thao tác này không thể hoàn tác."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }
  ]
  return (
    <div>
      <Card 
      title= "Quản Lý Danh Mục" 
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm Danh Mục</Button>}
      >
        <Table 
        columns={colomns} 
        dataSource={categories} 
        rowKey='id'
        loading={loading}
        pagination={{ pageSize: 5 }}
        />

        <Modal
          title={editingCategory ? "Sửa Danh Mục" : "Thêm Danh Mục Mới"}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={() => setIsModalVisible(false)}
          okText="Lưu"
          cancelText="Hủy"
        >
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              label="Tên danh mục"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
            >
              <Input placeholder="Ví dụ: Trà sữa, Cà phê..." />
            </Form.Item>

          </Form>

        </Modal>


      </Card>
    </div>
  );
}

export default CategoryPage;