import React, { useEffect, useState } from "react";
import { Table, Input, message, Spin } from "antd";
import axios from "axios";

interface HistoryItem {
  time: string;
  content: string;
}

interface GroupedHistory {
  email: string;
  histories: HistoryItem[];
}

const HistoryPage = () => {
  const [groupedData, setGroupedData] = useState<GroupedHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>("");

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/history/all");
        groupByEmail(res.data);
      } catch (err) {
        message.error("Lỗi khi tải lịch sử cập nhật");
      } finally {
        setLoading(false);
      }
    };

    fetchHistories();
  }, []);

  // ✅ Gộp lịch sử theo email
  const groupByEmail = (data: any[]) => {
    const grouped: Record<string, HistoryItem[]> = {};

    data.forEach((item) => {
      if (!grouped[item.email]) {
        grouped[item.email] = [];
      }
      grouped[item.email].push({
        time: item.time,
        content: item.content,
      });
    });

    const result: GroupedHistory[] = Object.entries(grouped).map(([email, histories]) => ({
      email,
      histories: histories.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()),
    }));

    setGroupedData(result);
  };

  const filteredData = groupedData.filter((item) =>
    item.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const mainColumns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text: string) => <span className="font-semibold text-blue-700">{text}</span>,
    },
    {
      title: "Số lần cập nhật",
      key: "count",
      render: (_: any, record: GroupedHistory) => (
        <span className="text-gray-600">{record.histories.length} lần</span>
      ),
    },
  ];

  const expandedRowRender = (record: GroupedHistory) => {
    const innerColumns = [
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
      <Table
        columns={innerColumns}
        dataSource={record.histories}
        pagination={false}
       rowKey={(_, index) => (index !== undefined ? index.toString() : Math.random().toString())}

      />
    );
  };

  return (
 <div className="p-6 bg-white rounded-xl shadow-md min-h-screen">
  {/* Tiêu đề và ô tìm kiếm cùng hàng */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
    <h2 className="text-2xl font-bold text-green-700">Lịch sử cập nhật tài khoản</h2>

    <Input
      placeholder="Tìm kiếm theo email..."
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      className="w-full md:w-80 mt-2 md:mt-0"
      allowClear
    />
  </div>

  {loading ? (
    <div className="flex justify-center py-10">
      <Spin size="large" />
    </div>
  ) : (
    <Table
      columns={mainColumns}
      dataSource={filteredData}
      expandable={{ expandedRowRender }}
      rowKey={(record) => record.email}
      pagination={{ pageSize: 6 }}
      locale={{ emptyText: "Không có dữ liệu lịch sử" }}
    />
  )}
</div>

  );
};

export default HistoryPage;
