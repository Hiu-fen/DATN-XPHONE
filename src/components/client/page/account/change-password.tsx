"use client"

import { useState } from "react"
import { Form, Input, Button, message } from "antd"
import { LockOutlined, KeyOutlined, CheckCircleOutlined } from "@ant-design/icons"
import axios from "axios"

const ChangePassword = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      // Dummy user ID for demonstration. In a real app, this would come from auth context.
      const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {}
      const userId = user._id || "dummyUserId123"

      // Simulate API call
      const response = await axios.patch(`http://localhost:5000/api/users/change-password/${userId}`, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })

      if (response.status === 200) {
        message.success("Đổi mật khẩu thành công!")
        form.resetFields()
      } else {
        message.error(response.data.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.")
      }
    } catch (error: any) {
      console.error("Error changing password:", error)
      message.error(error.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-3 rounded-full">
            <LockOutlined className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Đổi mật khẩu</h1>
            <p className="text-blue-100 mt-1">Cập nhật mật khẩu tài khoản của bạn</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-6">
          <Form.Item
            name="currentPassword"
            label={<span className="font-semibold text-gray-700">Mật khẩu hiện tại</span>}
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại!" }]}
          >
            <Input.Password
              size="large"
              prefix={<KeyOutlined className="text-gray-400" />}
              placeholder="Nhập mật khẩu hiện tại"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label={<span className="font-semibold text-gray-700">Mật khẩu mới</span>}
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
            hasFeedback
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Nhập mật khẩu mới"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="confirmNewPassword"
            label={<span className="font-semibold text-gray-700">Xác nhận mật khẩu mới</span>}
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"))
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              prefix={<CheckCircleOutlined className="text-gray-400" />}
              placeholder="Xác nhận mật khẩu mới"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="w-full bg-blue-700 hover:!bg-blue-800 text-white rounded-lg shadow-md transition-all duration-200"
            >
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  )
}

export default ChangePassword
