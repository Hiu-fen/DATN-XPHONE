import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Input,
  Modal,
  Form,
  message,
  List,
  Radio,
  Popconfirm,
  Select,
} from "antd";
import AccountSiba from "./siba";

const AddressManager = () => {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [form] = Form.useForm();
  const [defaultId, setDefaultId] = useState<string>("");

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [detail, setDetail] = useState('');

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user._id;

  useEffect(() => {
    fetchAddresses();
    axios.get('http://localhost:5000/api/ghn/provinces').then(res => setProvinces(res.data));
  }, []);

  useEffect(() => {
    if (province)
      axios.get(`http://localhost:5000/api/ghn/districts?province_id=${province}`)
        .then(res => setDistricts(res.data));
  }, [province]);

  useEffect(() => {
    if (district)
      axios.get(`http://localhost:5000/api/ghn/wards?district_id=${district}`)
        .then(res => setWards(res.data));
  }, [district]);

  const getNameById = (id: number | string, list: any[]) => {
    const province = list.find(item => item.ProvinceID == id);
    if (province) return province.ProvinceName;

    const district = list.find(item => item.DistrictID == id);
    if (district) return district.DistrictName;

    const ward = list.find(item => item.WardCode == id);
    if (ward) return ward.WardName;

    return "";
  };

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/addresses/${userId}`);
      setAddresses(res.data);
      const defaultAddr = res.data.find((addr: any) => addr.isDefault);
      setDefaultId(defaultAddr?._id);
    } catch {
      message.error("Lỗi khi tải danh sách địa chỉ");
    }
  };

  const handleOpenModal = (address?: any) => {
    if (address) {
      setEditingAddress(address);
      form.setFieldsValue(address);
      setProvince(address.province_id || '');
      setDistrict(address.district_id || '');
      setWard(address.ward_code || '');
      setDetail(address.detail || '');


    } else {
      form.resetFields();
      setEditingAddress(null);
      setProvince('');
      setDistrict('');
      setWard('');
      setDetail('');
    }
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const fullAddress = `${detail}, ${getNameById(ward, wards)}, ${getNameById(district, districts)}, ${getNameById(province, provinces)}`;

      const payload = {
        ...values,
        userId,
        isDefault: values.isDefault || false,
        address: fullAddress,
        detail,
        province_id: province,
        district_id: district,
        ward_code: ward
      };


      if (editingAddress) {
        await axios.patch(`http://localhost:5000/api/addresses/${editingAddress._id}`, payload);
        message.success("Cập nhật địa chỉ thành công");
      } else {
        await axios.post("http://localhost:5000/api/addresses", payload);
        message.success("Thêm địa chỉ mới thành công");
      }

      // Nếu là địa chỉ mặc định thì cập nhật thông tin người dùng
      if (payload.isDefault) {
        await axios.patch(`http://localhost:5000/api/users/${userId}`, {
          address: payload.address,
          sdt: payload.phone
        });

        localStorage.setItem("user", JSON.stringify({ ...user, address: payload.address, sdt: payload.phone }));
      }

      setIsModalVisible(false);
      fetchAddresses();
    } catch {
      message.error("Vui lòng điền đầy đủ thông tin");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/addresses/${id}`);
      message.success("Xóa địa chỉ thành công");
      fetchAddresses();
    } catch {
      message.error("Lỗi khi xoá địa chỉ");
    }
  };

  const handleSetDefault = async (address: any) => {
    try {
      await axios.patch(`http://localhost:5000/api/addresses/${address._id}`, {
        ...address,
        isDefault: true,
      });

      await axios.patch(`http://localhost:5000/api/users/${userId}`, {
        address: address.address,
        sdt: address.phone
      });

      localStorage.setItem("user", JSON.stringify({ ...user, address: address.address, sdt: address.phone }));
      setDefaultId(address._id);
      message.success("Đã chọn làm địa chỉ chính");
      fetchAddresses();
    } catch {
      message.error("Lỗi khi cập nhật địa chỉ chính");
    }
  };

  return (
    <div className="flex font-sans text-gray-800 bg-gray-100 p-10">
      <AccountSiba />
      <div className="flex-grow p-10 bg-white rounded-r-lg shadow-md relative flex flex-col w-full">
        <h1 className="text-2xl font-bold mb-6">Quản lý địa chỉ</h1>
        <Button type="primary" onClick={() => handleOpenModal()}>
          + Thêm địa chỉ mới
        </Button>

        <List className="mt-6" bordered dataSource={addresses} renderItem={(item) => (
          <List.Item
            actions={[
              <Button type="link" onClick={() => handleOpenModal(item)}>Sửa</Button>,
              <Popconfirm
                title="Bạn có chắc muốn xoá địa chỉ này không?"
                onConfirm={() => handleDelete(item._id)}
              >
                <Button danger type="link">Xóa</Button>
              </Popconfirm>,
            ]}
          >
            <div className="flex justify-between items-center w-full">
              <div>
                <p className="font-semibold">{item.name} - {item.phone}</p>
                <p>{item.address}</p>
              </div>
              <Radio
                checked={defaultId === item._id}
                onChange={() => handleSetDefault(item)}
              >
                Địa chỉ chính
              </Radio>
            </div>
          </List.Item>
        )} />

        <Modal
          title={editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onOk={handleSubmit}
          okText="Lưu"
          cancelText="Hủy"
        >
          <Form layout="vertical" form={form}>
            <Form.Item name="name" label="Tên người nhận" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item name="province_id" label="Tỉnh/Thành phố" rules={[{ required: true }]}>
              <Select value={province} onChange={value => {
                setProvince(value);
                form.setFieldValue('province_id', value); // Cập nhật lại cho form
              }} placeholder="Chọn Tỉnh/TP">
                {provinces.map(p => (
                  <Select.Option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="district_id" label="Quận/Huyện" rules={[{ required: true }]}>
              <Select value={district} onChange={value => {
                setDistrict(value);
                form.setFieldValue('district_id', value);
              }} placeholder="Chọn Quận/Huyện">
                {districts.map(d => (
                  <Select.Option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="ward_code" label="Phường/Xã" rules={[{ required: true }]}>
              <Select value={ward} onChange={value => {
                setWard(value);
                form.setFieldValue('ward_code', value);
              }} placeholder="Chọn Phường/Xã">
                {wards.map(w => (
                  <Select.Option key={w.WardCode} value={w.WardCode}>{w.WardName}</Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Số nhà, tên đường" required>
              <Input value={detail} onChange={e => setDetail(e.target.value)} />
            </Form.Item>


            <Form.Item name="isDefault" valuePropName="checked">
              <Radio>Đặt làm địa chỉ chính</Radio>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default AddressManager;
