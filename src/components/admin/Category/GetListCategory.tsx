
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Input, message, Popconfirm, Space, Table } from 'antd'
import axios from 'axios'
import React, { useState } from 'react'
// import { IProduct } from '../../interface/product'
import { useNavigate } from 'react-router-dom'
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { ICategory } from '../../../interface/category'



const GetListCategory = () => {
  const nav = useNavigate();
    const [searchText, setSearchText] = useState('');
  
  const {data,refetch} =useQuery({
    queryKey:['products'],
    queryFn: async () => (await axios.get(`http://localhost:5000/api/category`)).data
  })
  const mutation = useMutation({
    mutationFn: async (id:string) => await axios.delete(`http://localhost:5000/api/category/${id}`),
    onSuccess:()=>{
      message.success("Xóa thành công")
      refetch()
    }
  })
  const onDelete = (id:string)=>{
    mutation.mutate(id)
  }
const search = data?.filter((c: ICategory) => {
  const Text = `${c._id} ${c.name} ${c.mota} `.toLowerCase();
  return Text.includes(searchText.toLowerCase());
});


const columns = [
  {
    title:"Stt",
    key:'stt',
    render:(_:any,__:ICategory,index:number) => index + 1
  },
  {
    title:"Name",
    key:'name',
    dataIndex:'name',
  },
  {
    title:"Ảnh minh họa",
    key:'image',
    dataIndex:'image',
    render:(img:string)=> <img src={img} width={100}></img>
  },
  {
    title:"Mô tả danh mục",
    key:'mota',
    dataIndex:'mota',
  },
  {
    title:"Thao tác",
    key:'action',
    render: (_: any, record: ICategory) => (
      <Space>
  <Button 
    type="default"
    onClick={() => nav(`/admin/category/${record._id}`)} 
  >
    <EyeOutlined />
  </Button>

  <Button 
    type="primary"
    onClick={() => nav(`/admin/category/${record._id}/edit`)}
  >
    <EditOutlined />
  </Button>

  <Popconfirm
    title="Thông báo"
    description="Bạn chắc chắn muốn xóa?"
    icon={<DeleteOutlined style={{ color: 'red' }} />}
    onConfirm={() => onDelete(record._id)}
    okText="OK"
    cancelText="NO"
  >
    <Button danger>
      <DeleteOutlined />
    </Button>
  </Popconfirm>
</Space>
    )
  },
]

 
  return (
    <div>
     <h2 className="text-2xl font-bold ">Danh mục</h2>
       <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Input.Search
        placeholder=""
        className="mb-4"
         style={{ width: 300 }} 
        onChange={(e) => setSearchText(e.target.value)}
        allowClear
      />
       </div>
      
     <Table dataSource={search} columns={columns}
        pagination={{
        pageSize: 10, 
        showSizeChanger: false,
        pageSizeOptions: ['5', '10', '20'],
      }}
     />
    </div>

  )
}

export default GetListCategory

