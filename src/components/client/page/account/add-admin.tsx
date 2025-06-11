import React, { useState, useEffect } from 'react'
import { Form, Input, Button, message, Card, Typography } from 'antd'
import { UserAddOutlined } from '@ant-design/icons'
import AccountSiba from './siba'

const { Title, Text } = Typography
const { TextArea } = Input

const AddAccountAdmin = () => {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('admin') || '{}')
    if (user && user.email) {
      form.setFieldsValue({
        email: user.email,
        name: user.name,
        phone: user.sdt,
        address: user.address,
      })
    }
  }, [form])

  const onFinish = (values: {
    name: string
    email: string
    phone: string
    address: string
    description: string
  }) => {
    setLoading(true)

    try {
      const newNotification = {
        message: `Yêu cầu đăng ký tài khoản bán hàng từ ${values.email}`,
        time: new Date().toLocaleString(),
        type: 'admin-register',
        createdBy: values.name,
        data: values,
      }

      const existing = JSON.parse(localStorage.getItem('notifications') || '[]')
      const updatedNotifications = [...existing, newNotification]
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications))

      message.success('Đã gửi yêu cầu tạo tài khoản bán hàng đến admin.')
    } catch (error) {
      console.error('Lỗi gửi yêu cầu:', error)
      message.error('Gửi yêu cầu thất bại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex font-sans text-gray-800 bg-gray-100 min-h-screen p-10">
      <AccountSiba />

      <div className="flex-grow p-6">
        <Card className="max-w-xl mx-auto shadow-md rounded-xl">
          <Title level={3} className="flex items-center gap-2">
            <UserAddOutlined /> Đăng ký tài khoản bán hàng
          </Title>
          <Text type="secondary">
            Điền thông tin bên dưới để gửi yêu cầu đến admin.
          </Text>

          <Form
            form={form}
            layout="vertical"
            className="mt-6"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="Họ và tên"
              name="name"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên.' }]}
            >
              <Input placeholder="Nhập tên đầy đủ của bạn" />
            </Form.Item>

            <Form.Item
              label="Email bán hàng"
              name="email"
              rules={[
                { required: true, message: 'Email không được để trống.' },
                { type: 'email', message: 'Email không hợp lệ.' },
              ]}
            >
              <Input disabled />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại.' }]}
            >
              <Input placeholder="Nhập số điện thoại của bạn" />
            </Form.Item>

            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ.' }]}
            >
              <Input placeholder="Nhập địa chỉ hiện tại" />
            </Form.Item>

            <Form.Item
              label="Mô tả yêu cầu"
              name="description"
              rules={[{ required: true, message: 'Vui lòng nhập mô tả yêu cầu.' }]}
            >
              <TextArea
                rows={4}
                placeholder="Lý do bạn muốn bán hàng, loại sản phẩm bạn bán, kinh nghiệm,..."
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full"
              >
                Gửi yêu cầu đăng ký
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  )
}

export default AddAccountAdmin
