import { useEffect, useState } from "react"
import type { Option, OptionGroup } from "../../types/option.type";
import type { AxiosError } from "axios";
import { Button, Card, Form, Input, InputNumber, message, Modal, Popconfirm, Space, Switch, Table, Tag } from "antd";
import { foodService } from "../../services/food.service";
import { DeleteOutlined, EditOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { optionGroupService } from "../../services/option.service";
import { merchantService } from "../../services/merchant.service";
import type { ApiErrorResponse } from "../../types/api.type";

function OptionGroupPage(){
    const [optionGroupData, setOptionGroupData] = useState<OptionGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingGroup, setEditingGroup] = useState<OptionGroup | null>(null);

    const [form] = Form.useForm();

    useEffect(() => {
        fetchOptionGroup();
    },[])

    const fetchOptionGroup = async () => {
        try {
            setLoading(false);
            const res = await foodService.getOptionGroups();
            setOptionGroupData(res.data);

        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse> ;
            message.error(err.response?.data.message ?? "Lỗi khi tải dữ OptionGroup");
        }finally{
            setLoading(false)
        }
    }

    const handleAdd = () =>{
        setEditingGroup(null);
        form.resetFields();

        form.setFieldsValue({
            is_mandatory: false,
            max_choices: 1,
            options: [{ name: "", price_adjustment: 0 }] // Khởi tạo sẵn 1 dòng trống cho tùy chọn con
        });
        setIsModalVisible(true);
    };
    const handleEdit = (group: OptionGroup) => {
        setEditingGroup(group);
        form.setFieldsValue(group);
        setIsModalVisible(true);
    }

    const handleDelete = async (id: number) => {
        try {
            const res = await optionGroupService.deleteOptionGroup(id);
            message.success(res.message ?? "Xóa thành công!");
            fetchOptionGroup();
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>
            message.error(err.response?.data.message ?? "Lỗi khi xóa options")
        }
    }

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if(editingGroup){
                const response =await optionGroupService.updateOptionGroup(editingGroup.id,values);
                message.success(response.message ?? "Update các optionsGroup thành công")
            }else{
                const res = await merchantService.createOptionGroupWithOptions(values);
                message.success(res.data.message || "Thêm các optionsGroup thành công")
            }
            setIsModalVisible(false);
            fetchOptionGroup();
        } catch (error) {
            const err = error as AxiosError<ApiErrorResponse>
            message.error(err.response?.data?.message ?? "Lỗi khi thêm hoặc update OptionsGroup")
        }
    }

    const columns = [
        {
            title: "Tên nhóm tùy chọn",
            dataIndex: "name",
            key: "name",
            reder: (text: string) => <strong>{text}</strong>
        },
        {
            title: "Bắt buộc chọn",
            dataIndex: "is_mandatory",
            key: "is_mandatory",
            render: (isMandatory: boolean) => (
                <Tag color={isMandatory ? "red" : "default"}>
                    {isMandatory ? "Bắt buộc" : "Không bắt buộc"}
                </Tag>
            )
        },
        {
            title: "Chọn tối đa",
            dataIndex: "max_choices",
            key: "max_choices",
            render: (max: number) => `${max} lựa chọn`
        },
        {
            title: "Các lựa chọn chi tiết",
            dataIndex: "options",
            key: "options",
            render: (option: Option[]) => (
                <Space size={[0,8]} wrap>
                    {option.map((opt, index) => (
                        <Tag color="blue" key={index}>
                            {opt.name} {opt.price_adjustment > 0 ? `(+${opt.price_adjustment.toLocaleString('vi-VN')}đ)` : ""}
                        </Tag>
                    ))}
                </Space>
            )
        },
        {
            title: "Hành động",
            dataIndex: "action",
            render: (_:any, record: OptionGroup) => (
                <Space size="middle">
                    <Button type="text" onClick={() => handleEdit(record)} icon={<EditOutlined style={{ color: "#1890ff" }} />} />
                    <Popconfirm
                    title = "Xóa nhóm này ?"
                    description="Các món ăn đang dùng nhóm này sẽ bị ảnh hưởng."
                    onConfirm={() => handleDelete(record.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{danger: true}}
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />

                    </Popconfirm>
                </Space>
            )

        }
    ]

    return(
        <>
        <Card
        title="Danh sách Tùy chọn (Mức đá, Đường, Topping...)"
        extra={
            <Button
            type="primary" icon={<PlusOutlined/>} onClick={handleAdd}>
                Thêm nhóm mới
            </Button>
        }
        >
            <Table dataSource={optionGroupData} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 5 }} />

            <Modal
            title={editingGroup ? "Chỉnh sửa Nhóm Tùy Chọn" : "Thêm Nhóm Tùy Chọn Mới"}
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            okText="Lưu"
            onOk={handleOk}
            cancelText="Hủy"
            width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Tên nhóm (VD: Chọn mức đá)" rules={[{ required: true, message: "Vui lòng nhập tên nhóm!" }]}>
                        <Input placeholder="Nhập tên nhóm tùy chọn..." />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="is_mandatory" label="Bắt buộc phải chọn" valuePropName="checked">
                            <Switch checkedChildren="Bắt buộc" unCheckedChildren="Không"/>
                        </Form.Item>

                        <Form.Item name="max_choices" label="Số lượng được chọn tối đa" rules={[{ required: true }]}>
                            <InputNumber min={1} className="w-full" />
                        </Form.Item>
                    </div>

                    {/* PHẦN MAGIC: Dùng Form.List để quản lý mảng các Lựa chọn con */}
                    <div className="mt-4 mb-2">
                    <strong>Danh sách lựa chọn chi tiết:</strong>
                    </div>
                    
                    <Form.List name="options">
                    {(fields, { add, remove }, { errors }) => (
                        <>
                        {fields.map(({ key, name, ...restField }) => (
                            <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                            <Form.Item
                                {...restField}
                                name={[name, "name"]}
                                rules={[{ required: true, message: "Thiếu tên" }]}
                            >
                                <Input placeholder="Tên (VD: 100% Đá)" style={{ width: 250 }} />
                            </Form.Item>

                            <Form.Item
                                {...restField}
                                name={[name, "price_adjustment"]}
                                rules={[{ required: true, message: "Thiếu giá" }]}
                            >
                                <InputNumber
                                placeholder="Giá cộng thêm"
                                min={0}
                                step={1000}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                style={{ width: 150 }}
                                />
                            </Form.Item>

                            <MinusCircleOutlined className="text-red-500 text-lg cursor-pointer" onClick={() => remove(name)} />
                            </Space>
                        ))}
                        
                        <Form.Item>
                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                            Thêm lựa chọn con
                            </Button>
                            <Form.ErrorList errors={errors} />
                        </Form.Item>
                        </>
                    )}
                    </Form.List>
                </Form>

            </Modal>

        </Card>
        </>
    )
}

export default OptionGroupPage