import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Input, message, Popconfirm, Table, Tag } from "antd";
import { Promotion } from "../../../interface/promotion";
import axios from "axios";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const GetPromotion = () => {
    const [searchText, setSearchText] = useState('');
  const { data, isLoading } = useQuery<Promotion[]>({
    queryKey: ['promotions'],
    queryFn: async () => {
      try {
        const response = await axios.get(`http://localhost:4000/promotions`)
        return response.data
      } catch (error) {
        console.log(error)
        message.error('Lỗi khi tải danh sách khuyến mãi')
        throw error
      }
    }
  })

  const nav = useNavigate()

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await axios.delete(`http://localhost:4000/promotions/${id}`)
      } catch (error) {
        console.log(error)
      }
    },
    onSuccess: () => {
      message.success('Xóa thành công')
      queryClient.invalidateQueries({queryKey: ['promotions']})
    },
    onError: () => {
      message.error('Xóa thất bại')
    }
  })

  const onDelete = async (id:string) => {
    mutation.mutate(id)
  }
  const search = data?.filter((pro: Promotion)=>{
    const Text = `${pro.id} ${pro.name} ${pro.status} ${pro.code}`.toLowerCase()
    return Text.includes(searchText.toLowerCase());
  })

  const columns = [
    {
      title: 'STT',
      dataIndex: 'STT',
      key: 'STT',
      render: (_: any, __: Promotion, index: number) => index + 1,
    },
    {
      title: 'Tên khuyến mãi',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mã khuyến mãi',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const boolStatus = status === "true";
        return (
          <Tag color={boolStatus ? "green" : "red"}>
            {boolStatus ? 'Hoạt động' : 'Hết hạn'}
          </Tag>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'id',
      dataIndex: 'id',
      render: (id:string) => (
        <>
          <div className='flex justify-center items-center'>
              <Button className='mr-2' type="primary" onClick={() => nav(`/admin/promotion/edit/${id}`)}>
                  <EditOutlined />
              </Button>
              <Button className='mr-2' onClick={() => nav(`/admin/promotion/detail/${id}`)}>
                  <EyeOutlined />
              </Button>
              <Popconfirm
                  title="Thông báo!!!"
                  description="Bạn chắc chắn xóa chứ?"
                  onConfirm={() => onDelete(id)}
                  okText="Yes"
                  cancelText="No"
              >
                  <Button danger>
                      <DeleteOutlined /> 
                  </Button>
              </Popconfirm>
          </div>
        </>
      ),
    },

  ];

  return (
    <div className="p-5">
 <h2 className="text-2xl font-bold ">Danh sách khuyến mãi</h2>

  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
    <Input.Search
      placeholder=""
      style={{ width: 300 }} 
      className="mb-4"
      onChange={(e) => setSearchText(e.target.value)}
      allowClear
    />
  </div>

  <Table 
    dataSource={search} 
    columns={columns} 
    pagination={false}
    loading={isLoading}
    rowKey="id"
  />
</div>

  );
}

export default GetPromotion
