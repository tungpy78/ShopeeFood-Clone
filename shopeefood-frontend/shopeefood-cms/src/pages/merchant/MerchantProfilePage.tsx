import { Alert, Button, Card, Form, Image, Input, message, Skeleton, Tag, TimePicker, Upload } from "antd";
import { useEffect, useState } from "react";
import { merchantService } from "../../services/merchant.service";
import type { AxiosError } from "axios";
import dayjs from "dayjs";
import ShopOutlined from "@ant-design/icons/lib/icons/ShopOutlined";
import SaveOutlined from "@ant-design/icons/lib/icons/SaveOutlined";
import PlusOutlined from "@ant-design/icons/lib/icons/PlusOutlined";
import MapPicker from "../../components/common/MapPicker";
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import axiosClient from "../../services/axiosClient";
import type { ApiErrorResponse } from "../../types/api.type";

function MerchantProfilePage() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isCreateMode, setIsCreateMode] = useState(true); // Mặc định là chế độ tạo mới
    const [merchantStatus, setMerchantStatus] = useState<string>(''); // Lưu trạng thái quán
    // Khai báo state để lưu tọa độ map khi load từ API
    const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

    const customUpload = async (options: any) => {
            const { file, onSuccess, onError } = options;
            const formData = new FormData();
            formData.append('image', file); // Chữ 'image' này phải khớp với uploadCloud.single('image') ở Backend

            setUploading(true);
            try {
                // Bắn file lên API /upload của Backend
                const res = await axiosClient.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                // Backend trả về cái url của Cloudinary
                const uploadedUrl = res.data.imageUrl; 
                console.log("Ảnh đã upload, URL:", res.data);
                
                // Cập nhật giao diện hiện cái ảnh ra
                setImageUrl(uploadedUrl); 
                
                // Gán cái link url đó vào form ẩn để lát nữa bấm "Lưu Thay Đổi" nó gửi kèm đi
                form.setFieldsValue({ cover_image: uploadedUrl }); 
                
                onSuccess("ok");
                message.success('Tải ảnh bìa thành công!');
            } catch (error) {
                const err = error as AxiosError<ApiErrorResponse>;
                message.error(err.response?.data?.message ?? "Tải ảnh thất bại");
                onError(err);
            } finally {
                setUploading(false);
            }
        };

    useEffect(()=>{
        const fetchProfile = async () => {
            try {
                const response = await merchantService.getProfile();
                if (response && response.data) {
                    setIsCreateMode(false); // Có dữ liệu, chuyển sang chế độ cập nhật
                    setMerchantStatus(response.data.status); // Lưu trạng thái quán

                    // Set lại trung tâm bản đồ nếu đã có tọa độ lưu trong DB
                    if (response.data.latitude && response.data.longitude) {
                        setMapCenter([parseFloat(response.data.latitude), parseFloat(response.data.longitude)]);
                    }

                    form.setFieldsValue({
                        ...response.data,
                        open_time: response.data.open_time ? dayjs(response.data.open_time, 'HH:mm') : null,
                        close_time: response.data.close_time ? dayjs(response.data.close_time, 'HH:mm') : null,
                    })
                    if (response.data.cover_image) {
                        setImageUrl(response.data.cover_image); 
                    }
                }
            } catch (error) {
                
                const err = error as AxiosError<ApiErrorResponse>;
                message.error(err.response?.data?.message ?? "An error occurred while fetching the merchant profile.");

            }finally{
                setLoading(false);
            }
        };
        fetchProfile();
    },[form]);

    // Logic kiểm tra trạng thái chờ duyệt
  const isPending = merchantStatus === 'PENDING_APPROVAL';

  const onFinish = async (values: any) => {
    try {
        const payload = {
            ...values,
            open_time: values.open_time ? values.open_time.format('HH:mm') : null,
            close_time: values.close_time ? values.close_time.format('HH:mm') : null,
        };
        if (isCreateMode){
            // Gọi API Tạo mới
            await merchantService.create(payload);
            message.success('Đăng ký quán thành công! Chờ Admin duyệt nhé. 🎉');
            setIsCreateMode(false); // Chuyển về chế độ xem
        }else{
            // Gọi API Cập nhật
            await merchantService.update(payload);
            message.success('Cập nhật thành công!');
        }

    } catch (error) {
        const err = error as AxiosError<ApiErrorResponse>;
        message.error(err.response?.data?.message ?? "An error occurred while submitting the form.");
    }
  };

  if (loading) return <Skeleton active />;

    return(
        <>
            <div className="max-w-3xl mx-auto">
                {/* Thông báo nếu đang ở chế độ tạo mới */}
                {isCreateMode && (
                    <Alert
                    message="Chào mừng chủ quán mới!"
                    description="Bạn cần điền thông tin bên dưới để bắt đầu kinh doanh trên ShopeeFood."
                    type="info"
                    showIcon
                    className="mb-4"
                    />
                )}
                <Card 
                    title={
                    <div className="flex justify-between items-center">
                        <span><ShopOutlined className="mr-2"/>Thông Tin Quán</span>
                        {/* 2. HIỂN THỊ BADGE TRẠNG THÁI GÓC PHẢI */}
                        {!isCreateMode && (
                        <div>
                            {merchantStatus === 'ACTIVE' && <Tag color="success" icon={<CheckCircleOutlined />}>Đang hoạt động</Tag>}
                            {merchantStatus === 'PENDING_APPROVAL' && <Tag color="warning" icon={<ClockCircleOutlined />}>Chờ duyệt</Tag>}
                            {merchantStatus === 'BANNED' && <Tag color="error" icon={<CloseCircleOutlined />}>Đã bị khóa</Tag>}
                        </div>
                        )}
                    </div>
                    } 
                    className="shadow-sm"
                >
                    <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}>
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item label="Tên quán" name="name" rules={[{ required: true, message: 'Nhập tên quán' }]}>
                            <Input size="large" placeholder="Ví dụ: Cơm Tấm Sài Gòn" />
                            </Form.Item>
                                <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Nhập SĐT' }]}>
                                <Input size="large" />
                            </Form.Item>
                        </div>
                        <Form.Item label="Chọn vị trí quán">
                        <MapPicker
                            initialPosition={mapCenter} // Truyền tọa độ lấy từ DB vào đây
                            onChange={(lat, lng, address) => {
                            form.setFieldsValue({
                                latitude: lat,
                                longitude: lng,
                                address: address,
                            });
                            }}
                        />
                        </Form.Item>
                        <Form.Item label="Địa chỉ quán" name="address" rules={[{ required: true, message: 'Nhập địa chỉ' }]}>
                            <Input.TextArea rows={2} placeholder="Số nhà, tên đường..." />
                        </Form.Item>
                        {/* Ẩn hai ô input Latitude/Longitude đi cho UI gọn gàng (người dùng không cần gõ tay cái này) */}
                        <Form.Item name="latitude" hidden><Input /></Form.Item>
                        <Form.Item name="longitude" hidden><Input /></Form.Item>
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item label="Giờ mở cửa" name="open_time" rules={[{ required: true }]}>
                            <TimePicker format="HH:mm" className="w-full" size="large" />
                            </Form.Item>
                            <Form.Item label="Giờ đóng cửa" name="close_time" rules={[{ required: true }]}>
                            <TimePicker format="HH:mm" className="w-full" size="large" />
                            </Form.Item>
                        </div>
                        {/* Trường này ẩn đi, mục đích chỉ để hứng cái Link URL lưu vào DB */}
                        <Form.Item name="cover_image" hidden>
                            <Input />
                        </Form.Item>

                        {/* Giao diện cái cục vuông vuông để click vào chọn ảnh */}
                        <Form.Item label="Ảnh bìa quán">
                            <Upload
                                name="avatar"
                                listType="picture-card"
                                className="avatar-uploader"
                                showUploadList={false} // Tắt cái danh sách file mặc định
                                customRequest={customUpload} // Chạy hàm upload mình vừa viết
                            >
                                {imageUrl ? (
                                    // Nếu có ảnh thì hiện ảnh ra vừa vặn cái khung
                                    <Image src={imageUrl} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                ) : (
                                    // Nếu chưa có ảnh thì hiện nút Dấu Cộng
                                    <div>
                                        {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                                        <div className="mt-2">{uploading ? 'Đang tải...' : 'Tải ảnh lên'}</div>
                                    </div>
                                )}
                            </Upload>
                        </Form.Item>
                        {!isPending && (
                            <Form.Item className="mt-4">
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                icon={isCreateMode ? <PlusOutlined /> : <SaveOutlined />} 
                                size="large"
                            >
                                {isCreateMode ? 'Đăng Ký Mở Quán' : 'Lưu Thay Đổi'}
                            </Button>
                            </Form.Item>
                        )}
                    </Form>
                </Card>

            </div>
        </>
    )
}
export default MerchantProfilePage;