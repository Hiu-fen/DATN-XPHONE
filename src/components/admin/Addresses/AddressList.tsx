import React, { useEffect, useState } from 'react';
import { Table, Select, message, Tag, Popconfirm, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

interface IUser {
    _id: string;
    name: string;
    email: string;
}

interface IAddress {
    _id: string;
    userId: string;
    name: string;
    phone: string;
    address: string;
    detail: string;
    isDefault: boolean;
}

const AddressList: React.FC = () => {
    const [users, setUsers] = useState<IUser[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [addresses, setAddresses] = useState<IAddress[]>([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // 🔹 Lấy danh sách tài khoản
    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/users/clients');
            setUsers(res.data);
        } catch (error) {
            message.error('Không thể tải danh sách tài khoản!');
        }
    };

    // 🔹 Lấy tất cả địa chỉ
    const fetchAllAddresses = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/addresses');
            setAddresses(res.data);
        } catch (error) {
            message.error('Không thể tải danh sách địa chỉ!');
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Lấy địa chỉ theo user
    const fetchAddressesByUser = async (userId: string) => {
        try {
            setLoading(true);
            const res = await axios.get(`http://localhost:5000/api/addresses/${userId}`);
            setAddresses(res.data);
        } catch (error) {
            message.error('Không thể tải địa chỉ người dùng!');
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Khi chọn user
    const handleUserChange = (value: string) => {
        setSelectedUserId(value);
        if (value) {
            fetchAddressesByUser(value);
        } else {
            fetchAllAddresses();
        }
    };

    // 🔹 Xoá địa chỉ
    const handleDelete = async (id: string) => {
        try {
            setDeletingId(id);
            await axios.delete(`http://localhost:5000/api/addresses/${id}`);
            setAddresses(prev => prev.filter(item => item._id !== id));
            message.success('Xoá địa chỉ thành công!');
        } catch (error) {
            message.error('Xoá địa chỉ thất bại!');
        } finally {
            setDeletingId(null);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchAllAddresses();
    }, []);

    const columns = [
        {
            title: 'STT',
            render: (_: any, __: IAddress, index: number) => index + 1,
        },
        {
            title: 'Tên người nhận',
            dataIndex: 'name',
        },
        {
            title: 'SĐT',
            dataIndex: 'phone',
        },
        {
            title: 'Địa chỉ',
            render: (_: any, record: IAddress) => (
                <>
                    <div>{record.address}</div>
                    <small className="text-gray-400">{record.detail}</small>
                </>
            )
        },
        {
            title: 'Mặc định',
            dataIndex: 'isDefault',
            render: (value: boolean) =>
                value ? <Tag color="green">Mặc định</Tag> : <Tag>-</Tag>,
        },
        {
            title: 'Thao tác',
            render: (_: any, record: IAddress) => (
                <Popconfirm
                    title="Xoá địa chỉ"
                    description="Bạn có chắc chắn muốn xoá?"
                    onConfirm={() => handleDelete(record._id)}
                    okText="Xoá"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true, loading: deletingId === record._id }}
                >
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        type="link"
                        loading={deletingId === record._id}
                    />
                </Popconfirm>
            ),
        },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4">Quản lý địa chỉ theo tài khoản</h2>

            <div className="mb-6">
                <Select
                    placeholder="Chọn tài khoản để lọc địa chỉ"
                    style={{ width: 350 }}
                    value={selectedUserId || undefined}
                    onChange={handleUserChange}
                    allowClear
                    options={[
                        { label: 'Tất cả tài khoản', value: '' },
                        ...users.map(user => ({
                            label: `${user.name} (${user.email})`,
                            value: user._id,
                        }))
                    ]}
                    showSearch
                    filterOption={(input, option) =>
                        (option?.label as string).toLowerCase().includes(input.toLowerCase())
                    }
                />
            </div>

            <Table
                rowKey="_id"
                columns={columns}
                dataSource={addresses}
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default AddressList;
