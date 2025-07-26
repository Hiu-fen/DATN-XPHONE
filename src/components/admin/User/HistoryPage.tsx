import React, { useEffect, useState } from "react";
import { Table, Select, message, Spin } from "antd";
import axios from "axios";

const { Option } = Select;

const HistoryPage = () => {
  const [histories, setHistories] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);

  // Lấy toàn bộ người dùng
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/");
             console.log("Danh sách người dùng:", res.data); // 👈 Thêm log
        setAllUsers(res.data);
      } catch (error) {
        message.error("Lỗi khi tải danh sách người dùng");
      }
    };
    fetchUsers();
  }, []);

  // Lấy lịch sử theo ID
  useEffect(() => {
    if (!selectedUserId) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${selectedUserId}/history`);
        setHistories(res.data);
      } catch (error) {
        message.error("Lỗi khi tải lịch sử cập nhật");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [selectedUserId]);

  // Lọc người dùng theo vai trò
  const filteredUsers = allUsers.filter((user) => {
    if (roleFilter === "all") return true;
    return user.role === roleFilter;
  });

  const columns = [
    {
      title: "Thời gian",
      dataIndex: "time",
      key: "time",
      render: (text: string) => new Date(text).toLocaleString("vi-VN"),
      width: 200,
    },
    {
      title: "Nội dung cập nhật",
      dataIndex: "content",
      key: "content",
      render: (text: string) => (
        <ul className="list-disc pl-4 space-y-1">
          {text.split(" | ").map((item, index) => (
            <li key={index} className="text-gray-700">{item}</li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div className="p-6 bg-white rounded-xl shadow-md min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-green-700">Lịch sử cập nhật tài khoản</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Bộ lọc vai trò */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Lọc theo vai trò:</label>
          <Select
            value={roleFilter}
            onChange={(value) => {
              setRoleFilter(value);
              setSelectedUserId(null);
              setHistories([]);
            }}
            className="w-48"
          >
            <Option value="all">Tất cả</Option>
            <Option value="admin">Admin</Option>
            <Option value="user">Người dùng</Option>
          </Select>
        </div>

        {/* Dropdown chọn tài khoản */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Chọn tài khoản:</label>
          <Select
            value={selectedUserId || undefined}
            onChange={setSelectedUserId}
            className="w-72"
            placeholder="Chọn tài khoản"
            showSearch
            optionFilterProp="children"
            notFoundContent="Không có tài khoản nào phù hợp"
          >
            {filteredUsers.map((user) => (
              <Option key={user._id} value={user._id}>
                {user.name} - {user.email}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Bảng lịch sử */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={histories}
          rowKey={(record) => record.time}
          pagination={{ pageSize: 6 }}
          locale={{ emptyText: "Không có dữ liệu lịch sử" }}
        />
      )}
    </div>
  );
};

export default HistoryPage;
    