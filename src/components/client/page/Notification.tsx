import React, { useState } from 'react'
import { Button, Tag } from 'antd'
import {
  BellOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'

const Notification = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Đơn hàng mới',
      content: 'Bạn có một đơn hàng mới cần xác nhận.',
      type: 'order',
      read: false,
      date: '11/06/2025',
    },
    {
      id: 2,
      title: 'Yêu cầu duyệt tài khoản',
      content: 'Người dùng Nguyễn Văn A yêu cầu duyệt tài khoản bán hàng.',
      type: 'approval',
      read: false,
      date: '10/06/2025',
    },
    {
      id: 3,
      title: 'Thông báo hệ thống',
      content: 'Hệ thống sẽ bảo trì lúc 23:00 hôm nay.',
      type: 'system',
      read: true,
      date: '09/06/2025',
    },
    {
      id: 4,
      title: 'Cập nhật sản phẩm',
      content: 'Sản phẩm ABC đã được cập nhật giá mới.',
      type: 'product',
      read: false,
      date: '09/06/2025',
    },
    {
      id: 5,
      title: 'Thông tin tài khoản',
      content: 'Bạn đã thay đổi mật khẩu thành công.',
      type: 'info',
      read: true,
      date: '08/06/2025',
    },
    {
      id: 6,
      title: 'Lỗi hệ thống',
      content: 'Có lỗi kết nối với máy chủ. Vui lòng thử lại sau.',
      type: 'error',
      read: false,
      date: '08/06/2025',
    },
  ])

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <CheckCircleOutlined className="text-green-500" />
      case 'approval':
        return <WarningOutlined className="text-yellow-500" />
      case 'system':
        return <InfoCircleOutlined className="text-blue-500" />
      case 'product':
        return <CheckCircleOutlined className="text-purple-500" />
      case 'info':
        return <InfoCircleOutlined className="text-cyan-500" />
      case 'error':
        return <WarningOutlined className="text-red-500" />
      default:
        return <BellOutlined />
    }
  }

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="p-10 max-w-5xl mx-auto font-sans">
      <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
        <BellOutlined className="text-blue-600" /> Trung tâm Thông báo
      </h1>

      {notifications.length === 0 ? (
        <p className="text-center text-gray-500 text-xl">
          Không có thông báo nào.
        </p>
      ) : (
        <div className="space-y-6">
          {notifications.map((note) => (
            <div
              key={note.id}
              className={`p-6 border rounded-xl shadow-sm bg-white flex justify-between items-start gap-4 ${
                note.read ? 'opacity-60' : 'bg-yellow-50'
              }`}
            >
              <div className="flex gap-3">
                <div className="text-2xl">{getIcon(note.type)}</div>
                <div>
                  <h3 className="text-xl font-semibold">{note.title}</h3>
                  <p className="text-base text-gray-600 mb-1">{note.content}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{note.date}</span>
                    {!note.read && <Tag color="orange">Chưa đọc</Tag>}
                    {note.read && <Tag color="green">Đã đọc</Tag>}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {!note.read && (
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() => markAsRead(note.id)}
                  >
                    Đánh dấu đã đọc
                  </Button>
                )}
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => deleteNotification(note.id)}
                >
                  Xóa
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notification
