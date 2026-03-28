import { useEffect, useState } from "react";
import type { Category } from "../../types/category.type";
import { CategoryService } from "../../services/category.service";
import { foodService } from "../../services/food.service";
import message from "antd/es/message";
import { Button, Card, Form, Image, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, Upload } from "antd";
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import EditOutlined from "@ant-design/icons/lib/icons/EditOutlined";
import type { CreateFoodRequest } from "../../types/food.type";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import axiosClient from "../../services/axiosClient";
import type { AxiosError } from "axios";
import LoadingOutlined from "@ant-design/icons/lib/icons/LoadingOutlined";
import type { ApiErrorResponse } from "../../types/api.type";

function FoodPage(){
    const [foods, setFoods] = useState<CreateFoodRequest[]>([]);
    const [categories, setCategories] = useState<Category[]>([]); // Chứa danh sách danh mục cho Dropdown
    const [loading, setLoading] = useState(false);
    const [optionGroups, setOptionGroups] = useState<any[]>([]); // Chứa danh sách Tùy chọn

    // State quản lý Modal
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingFood, setEditingFood] = useState<any | null>(null);
    
    // State quản lý Upload Ảnh
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

    const [form] = Form.useForm();
    
    

    // 1. Load danh sách Món ăn và Danh mục khi vào trang
  useEffect(() => {
    fetchFoods();
    fetchCategories();
    fetchOptionGroups();
  }, []);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const res = await foodService.getAll();
      setFoods(res.data)
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      message.error(err.response?.data.message ?? "Lỗi khi tải danh sách món ăn");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await CategoryService.getAll();
      setCategories(res.data);
    } catch (error) {
      const err = error as AxiosError<ApiErrorResponse>;
      message.error(err.response?.data.message ?? "Lỗi khi tải danh mục");
    }
  };

  const fetchOptionGroups = async () => {
    try {
        const res = await foodService.getOptionGroups();
        setOptionGroups(res.data);
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>
        message.error(err.response?.data?.message ?? "Lỗi khi tải dữ liệu Option Group");
    }
  }
  
  const customUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
        const res = await axiosClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
        });
        const uploadedUrl = res.data.imageUrl;
        setImageUrl(uploadedUrl);
        form.setFieldsValue({ image: uploadedUrl }); // Lưu link vào form
        onSuccess("ok");
        message.success('Tải ảnh thành công!');
    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        message.error(err.response?.data?.message ?? "Tải ảnh thất bại");
        onError(err);
    } finally {
      setUploading(false);
    }
  }

  const handleAdd = () => {
    setEditingFood(null); // Xóa trạng thái đang sửa (nếu có)
    form.resetFields();
    setImageUrl(undefined); // Reset ảnh đã upload (nếu có)
    setIsModalVisible(true);
  }

  const handleEdit = (food: CreateFoodRequest) => {
    setEditingFood(food);
    form.setFieldsValue({
        ...food,
         option_groups: food.option_groups?.map(group => group.id)
    });
    setImageUrl(food.image);
    setIsModalVisible(true);
  }

    const handleDelete = async (id: number) => {
        try {
            const res = await foodService.delete(id);
            message.success(res.message ??'Xóa món ăn thành công!');
            fetchFoods();
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            message.error(err.response?.data?.message ?? "Tải ảnh thất bại");
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if(editingFood) {
                const res = await foodService.update(editingFood.id, values);
                message.success(res.message ??'Cập nhật món ăn thành công!');
            } else {
                const res = await foodService.create(values);
                message.success( res.message ??'Thêm món ăn thành công!');
            }
            setIsModalVisible(false);
            fetchFoods();
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>;
            message.error(err.response?.data?.message ?? "Tải ảnh thất bại");
        }
    };
    console.log("food", foods)
    

  const coloumns = [
    {
        title: 'Ảnh món ăn',
        dataIndex: 'image',
        key: 'image',
        render: (text: string) => <Image src={text} alt="Food" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
    },
    {
        title: 'Tên món ăn',
        dataIndex: 'name',
        key: 'name'
    },
    {
        title: 'Mô tả',
        dataIndex: 'description',
        key: 'description'
    },
    {
        title: 'Danh mục',
        dataIndex: 'category_id',
        key: 'Category_id',
        render: (categoryId: number) => {
            const category = categories.find(cat => cat.id === categoryId);
            return category ? category.name : 'Không xác định';
        }
    },
    {
        title: 'Giá',
        dataIndex: 'price',
        key: 'price',
        render: (price: number) => price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    },
    {
        title: 'Trạng thái',
        dataIndex: 'is_available',
        key: 'is_available',
        render: (status: boolean) => {
            let color = 'default';
            if (status === true) color = 'green';
            else if (status === false) color = 'red';
            return <Tag color={color}>{status === true ? 'Còn hàng' : 'Hết hàng'}</Tag>;
        }
    },
    {
        title: 'Hành động',
        key: 'action',
        render: (_: any, record: CreateFoodRequest) => (
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
        )
    }
  ]

    return(
        <>
        <h1>Food Page</h1>
        <Card
        title="Danh sách món ăn"
        bordered={false}
        style={{ width: '100%' }}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm món ăn</Button>}
        >
            <Table
            dataSource={foods}
            columns={coloumns}
            loading={loading}
            pagination={{ pageSize: 5 }}
            >
                
            </Table>

            <Modal
            title={editingFood ? "Chỉnh sửa món ăn" : "Thêm Món Mới"}
            open={isModalVisible}
            onOk={handleOk}
            onCancel={() => setIsModalVisible(false)}
            okText = "Lưu"
            cancelText = "Hủy"
            >
                <Form
                form={form}
                layout="vertical"

                >
                    {/* Nơi chứa link ảnh ẩn */}
                    <Form.Item name="image" rules={[{ required: true, message: 'Vui lòng tải ảnh món ăn!' }]} hidden><Input /></Form.Item>

                    <div className="flex justify-center mb-6">
                        <Upload name="image" listType="picture-card" className="avatar-uploader" showUploadList={false} customRequest={customUpload}>
                        {imageUrl ? (
                            <img src={imageUrl} alt="food" className="w-20 h-20 object-cover" />
                        ) : (
                            <div>
                            {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                            <div className="mt-2">{uploading ? 'Đang tải...' : 'Tải ảnh'}</div>
                            </div>
                        )}
                        </Upload>
                    </div>
                    
                    <Form.Item name="name" label="Tên món ăn" rules={[{ required: true, message: 'Vui lòng nhập tên món!' }]}>
                        <Input placeholder="Ví dụ: Trà sữa trân châu đường đen" />
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea placeholder="Mô tả ngắn về món ăn" rows={4} />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="category_id" label= "Danh Mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}>
                            <Select placeholder = "Chọn Danh Mục "
                            options={categories.map(cat => ({
                                label: cat.name,
                                value: cat.id
                            }))}>
        
                            </Select>
                        </Form.Item>

                        <Form.Item name="price" label="Giá bán (VNĐ)" rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}>
                        <InputNumber<number>
                            className="w-full" 
                            min={0} 
                            step={1000}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} // Hiện dấu phẩy 10,000
                            parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, '') || 0)}
                        />
                        </Form.Item>

                        <Form.Item name="is_available" label="Trạng thái">
                            <Select>
                                <Select.Option value={true}>Còn hàng</Select.Option>
                                <Select.Option value={false}>Hết hàng</Select.Option>
                            </Select>
                        </Form.Item>

                    </div>
                    <Form.Item 
                        name="option_groups" 
                        label="Nhóm Tùy Chọn (Mức đá, Topping...)"
                    >
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder="Click để chọn các nhóm tùy chọn áp dụng cho món này"
                            options={optionGroups.map(group => ({
                                label: group.name, // Hiển thị tên (VD: Chọn mức đá)
                                value: group.id    // Value gửi đi là ID (VD: 10)
                            }))}
                        />
                    </Form.Item>


                    


                </Form>

            </Modal>
            

        </Card>
        </>
    )
};
export default FoodPage;