import React from 'react';
import { Table, Button, Popconfirm, message, Space, Row, Col } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IRam, IColor } from '../../../interface/variant';

const VariantList: React.FC = () => {
  const nav = useNavigate();
  const qc = useQueryClient();

  // Lấy danh sách RAM
  const { data: rams = [] } = useQuery<IRam[]>({
    queryKey: ['rams'],
    queryFn: () => axios.get('http://localhost:5000/api/rams').then(res => res.data),
  });

  // Lấy danh sách Color
  const { data: colors = [] } = useQuery<IColor[]>({
    queryKey: ['colors'],
    queryFn: () => axios.get('http://localhost:5000/api/colors').then(res => res.data),
  });

  // Xóa RAM
  const delRamMut = useMutation({
    mutationFn: (id: string) => axios.delete(`http://localhost:5000/api/rams/${id}`),
    onSuccess: () => {
      message.success('Xóa RAM thành công');
      qc.invalidateQueries({ queryKey: ['rams'] });
    },
  });

  // Xóa Color
  const delColorMut = useMutation({
    mutationFn: (id: string) => axios.delete(`http://localhost:5000/api/colors/${id}`),
    onSuccess: () => {
      message.success('Xóa màu thành công');
      qc.invalidateQueries({ queryKey: ['colors'] });
    },
  });

  // Cột bảng RAM
  const ramColumns = [
    { title: 'Dung lượng', dataIndex: 'size', key: 'size' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, row: IRam) => (
        <Space>
          <Button onClick={() => nav(`/admin/ram/${row._id}`)}>Sửa</Button>
          <Popconfirm
            title="Xác nhận xóa RAM?"
            onConfirm={() => delRamMut.mutate(row._id!)}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Cột bảng Color
  const colorColumns = [
    { title: 'Tên màu', dataIndex: 'name', key: 'name' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, row: IColor) => (
        <Space>
          <Button onClick={() => nav(`/admin/color/${row._id}`)}>Sửa</Button>
          <Popconfirm
            title="Xác nhận xóa màu?"
            onConfirm={() => delColorMut.mutate(row._id!)}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Row gutter={24}>
      {/* Cột RAM */}
      <Col span={12}>
        <Button
          type="primary"
          style={{ marginBottom: 16 }}
          onClick={() => nav('/admin/ram/add')}
        >
          Thêm RAM mới
        </Button>
        <Table rowKey="_id" dataSource={rams} columns={ramColumns} />
      </Col>

      {/* Cột Color */}
      <Col span={12}>
        <Button
          type="primary"
          style={{ marginBottom: 16 }}
          onClick={() => nav('/admin/color/add')}
        >
          Thêm màu mới
        </Button>
        <Table rowKey="_id" dataSource={colors} columns={colorColumns} />
      </Col>
    </Row>
  );
};

export default VariantList;
