"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Button, Input, Modal, Form, message, Radio, Popconfirm, Select, Card, Space, Tag, Divider } from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  PhoneOutlined,
  UserOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons"
import AccountSiba from "./siba" // Ensure this path is correct

const AddressManager = () => {
  const [addresses, setAddresses] = useState<any[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)
  const [form] = Form.useForm()
  const [defaultId, setDefaultId] = useState<string>("")
  const [provinces, setProvinces] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])
  const [province, setProvince] = useState("")
  const [district, setDistrict] = useState("")
  const [ward, setWard] = useState("")
  const [detail, setDetail] = useState("")
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const userId = user._id

  useEffect(() => {
    fetchAddresses()
    axios.get("http://localhost:5000/api/ghn/provinces").then((res) => setProvinces(res.data))
  }, [])

  useEffect(() => {
    if (province)
      axios.get(`http://localhost:5000/api/ghn/districts?province_id=${province}`).then((res) => setDistricts(res.data))
  }, [province])

  useEffect(() => {
    if (district)
      axios.get(`http://localhost:5000/api/ghn/wards?district_id=${district}`).then((res) => setWards(res.data))
  }, [district])

  const getNameById = (id: number | string, list: any[]) => {
    const province = list.find((item) => item.ProvinceID == id)
    if (province) return province.ProvinceName
    const district = list.find((item) => item.DistrictID == id)
    if (district) return district.DistrictName
    const ward = list.find((item) => item.WardCode == id)
    if (ward) return ward.WardName
    return ""
  }

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/addresses/${userId}`)
      setAddresses(res.data)
      const defaultAddr = res.data.find((addr: any) => addr.isDefault)
      setDefaultId(defaultAddr?._id)
    } catch {
      message.error("Lỗi khi tải danh sách địa chỉ")
    }
  }

  const handleOpenModal = (address?: any) => {
    if (address) {
      setEditingAddress(address)
      form.setFieldsValue(address)
      setProvince(address.province_id || "")
      setDistrict(address.district_id || "")
      setWard(address.ward_code || "")
      setDetail(address.detail || "")
    } else {
      form.resetFields()
      setEditingAddress(null)
      setProvince("")
      setDistrict("")
      setWard("")
      setDetail("")
    }
    setIsModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (!province || !district || !ward || !detail) {
        message.error("Vui lòng chọn đầy đủ Tỉnh, Huyện, Phường và nhập địa chỉ chi tiết")
        return
      }

      const fullAddress = `${detail}, ${getNameById(ward, wards)}, ${getNameById(district, districts)}, ${getNameById(province, provinces)}`
      const payload = {
        ...values,
        userId,
        isDefault: values.isDefault || false,
        address: fullAddress,
        detail,
        province_id: province,
        district_id: district,
        ward_code: ward,
      }

      if (editingAddress) {
        await axios.patch(`http://localhost:5000/api/addresses/${editingAddress._id}`, payload)
        message.success("Cập nhật địa chỉ thành công")
      } else {
        await axios.post("http://localhost:5000/api/addresses", payload)
        message.success("Thêm địa chỉ mới thành công")
      }

      if (payload.isDefault) {
        await axios.patch(`http://localhost:5000/api/users/${userId}`, {
          address: payload.address,
          sdt: payload.phone,
        })
        localStorage.setItem("user", JSON.stringify({ ...user, address: payload.address, sdt: payload.phone }))
      }

      setIsModalVisible(false)
      fetchAddresses()
    } catch {
      message.error("Vui lòng điền đầy đủ thông tin")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/addresses/${id}`)
      message.success("Xóa địa chỉ thành công")
      fetchAddresses()
    } catch {
      message.error("Lỗi khi xoá địa chỉ")
    }
  }

  const handleSetDefault = async (address: any) => {
    try {
      await axios.patch(`http://localhost:5000/api/addresses/${address._id}`, {
        ...address,
        isDefault: true,
      })
      await axios.patch(`http://localhost:5000/api/users/${userId}`, {
        address: address.address,
        sdt: address.phone,
      })
      localStorage.setItem("user", JSON.stringify({ ...user, address: address.address, sdt: address.phone }))
      setDefaultId(address._id)
      message.success("Đã chọn làm địa chỉ chính")
      fetchAddresses()
    } catch {
      message.error("Lỗi khi cập nhật địa chỉ chính")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col lg:flex-row font-sans text-gray-800 p-4 lg:p-8 gap-6">
        <AccountSiba />

        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-3 rounded-full">
                    <HomeOutlined className="text-white text-xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Quản lý địa chỉ</h1>
                    <p className="text-blue-100 mt-1">Quản lý danh sách địa chỉ giao hàng của bạn</p>
                  </div>
                </div>
                <Button
                  type="primary"
                  size="large"
                  icon={<PlusOutlined />}
                  onClick={() => handleOpenModal()}
                  className="bg-white text-blue-600 border-white hover:bg-blue-50 hover:border-blue-50 shadow-lg"
                >
                  Thêm địa chỉ mới
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {addresses.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                    <EnvironmentOutlined className="text-4xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có địa chỉ nào</h3>
                  <p className="text-gray-500 mb-6">Thêm địa chỉ đầu tiên để bắt đầu mua sắm</p>
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Thêm địa chỉ mới
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {addresses.map((item) => (
                    <Card
                      key={item._id}
                      className={`transition-all duration-200 hover:shadow-lg ${
                        defaultId === item._id
                          ? "border-blue-500 bg-blue-50/30"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      bodyStyle={{ padding: "24px" }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <UserOutlined className="text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                              <div className="flex items-center space-x-2 text-gray-600">
                                <PhoneOutlined className="text-sm" />
                                <span>{item.phone}</span>
                              </div>
                            </div>
                            {defaultId === item._id && (
                              <Tag color="blue" className="ml-2">
                                <HomeOutlined className="mr-1" />
                                Địa chỉ chính
                              </Tag>
                            )}
                          </div>

                          <div className="flex items-start space-x-2 text-gray-700">
                            <EnvironmentOutlined className="text-gray-400 mt-1 flex-shrink-0" />
                            <p className="leading-relaxed">{item.address}</p>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-6">
                          <Space direction="vertical" size="small">
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              onClick={() => handleOpenModal(item)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              Chỉnh sửa
                            </Button>

                            <Popconfirm
                              title="Xóa địa chỉ"
                              description="Bạn có chắc muốn xóa địa chỉ này không?"
                              onConfirm={() => handleDelete(item._id)}
                              okText="Xóa"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                            >
                              <Button type="text" danger icon={<DeleteOutlined />} className="hover:bg-red-50">
                                Xóa
                              </Button>
                            </Popconfirm>

                            {defaultId !== item._id && (
                              <>
                                <Divider className="my-2" />
                                <Button
                                  type="link"
                                  size="small"
                                  onClick={() => handleSetDefault(item)}
                                  className="text-green-600 hover:text-green-700 p-0 h-auto"
                                >
                                  Đặt làm địa chỉ chính
                                </Button>
                              </>
                            )}
                          </Space>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <div className="bg-blue-100 p-2 rounded-full">
              {editingAddress ? <EditOutlined className="text-blue-600" /> : <PlusOutlined className="text-blue-600" />}
            </div>
            <span className="text-lg font-semibold">{editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText="Lưu địa chỉ"
        cancelText="Hủy"
        width={600}
        okButtonProps={{
          size: "large",
          className: "bg-blue-600 hover:bg-blue-700",
        }}
        cancelButtonProps={{ size: "large" }}
      >
        <div className="pt-4">
          <Form layout="vertical" form={form} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="name"
                label="Tên người nhận"
                rules={[{ required: true, message: "Vui lòng nhập tên người nhận" }]}
              >
                <Input
                  size="large"
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Nhập tên người nhận"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
              >
                <Input
                  size="large"
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  placeholder="Nhập số điện thoại"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                name="province_id"
                label="Tỉnh/Thành phố"
                rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]}
              >
                <Select
                  size="large"
                  value={province}
                  onChange={(value) => {
                    setProvince(value)
                    form.setFieldValue("province_id", value)
                    setDistrict("")
                    setWard("")
                  }}
                  placeholder="Chọn Tỉnh/TP"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {provinces.map((p) => (
                    <Select.Option
                      key={p.ProvinceID}
                      value={p.ProvinceID}
                      style={{
                        backgroundColor: province === p.ProvinceID ? "#e6f3ff" : "transparent",
                        fontWeight: province === p.ProvinceID ? "bold" : "normal",
                      }}
                    >
                      {p.ProvinceName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="district_id"
                label="Quận/Huyện"
                rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
              >
                <Select
                  size="large"
                  value={district}
                  onChange={(value) => {
                    setDistrict(value)
                    form.setFieldValue("district_id", value)
                    setWard("")
                  }}
                  placeholder="Chọn Quận/Huyện"
                  disabled={!province}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {districts.map((d) => (
                    <Select.Option key={d.DistrictID} value={d.DistrictID}>
                      {d.DistrictName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="ward_code"
                label="Phường/Xã"
                rules={[{ required: true, message: "Vui lòng chọn phường/xã" }]}
              >
                <Select
                  size="large"
                  value={ward}
                  onChange={(value) => {
                    setWard(value)
                    form.setFieldValue("ward_code", value)
                  }}
                  placeholder="Chọn Phường/Xã"
                  disabled={!district}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {wards.map((w) => (
                    <Select.Option key={w.WardCode} value={w.WardCode}>
                      {w.WardName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              label="Địa chỉ chi tiết"
              required
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ chi tiết" }]}
            >
              <Input.TextArea
                size="large"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Số nhà, tên đường, khu vực..."
                rows={3}
              />
            </Form.Item>

            <Form.Item name="isDefault" valuePropName="checked">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Radio className="text-blue-700 font-medium">
                  <HomeOutlined className="mr-2" />
                  Đặt làm địa chỉ giao hàng chính
                </Radio>
                <p className="text-sm text-blue-600 mt-1 ml-6">
                  Địa chỉ này sẽ được sử dụng làm mặc định cho các đơn hàng
                </p>
              </div>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  )
}

export default AddressManager