
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Input, message, Popconfirm, Table } from 'antd'
import axios from 'axios'
import React, { useState } from 'react'
// import { IProduct } from '../../interface/product'
import { useNavigate } from 'react-router-dom'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Icatagory } from '../../../interface/category'



const GetListCategory = () => {
  const nav = useNavigate();
    const [searchText, setSearchText] = useState('');
  
  const {data,refetch} =useQuery({
    queryKey:['products'],
    queryFn: async () => (await axios.get(`http://localhost:4000/category`)).data
  })
  const mutation = useMutation({
    mutationFn: async (id:string) => await axios.delete(`http://localhost:4000/category/${id}`),
    onSuccess:()=>{
      message.success("Xóa thành công")
      refetch()
    }
  })
  const onDelete = (id:string)=>{
    mutation.mutate(id)
  }
const search = data?.filter((c: Icatagory) => {
  const Text = `${c.id} ${c.name} ${c.mota} `.toLowerCase();
  return Text.includes(searchText.toLowerCase());
});


  const columns = [
    {
      title:"Stt",
      key:'stt',
      render:(_:any,__:Icatagory,index:number) => index + 1
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
      title:"Mo tả danh mục",
      key:'mota',
      dataIndex:'mota',
    },
   
    {
      title:"Thao tác",
      key:'id',
      dataIndex:'id',
      render:(id:string)=><>
      <Button onClick={()=>nav(`/admin/category/${id}/edit`)}><EditOutlined/></Button>
      <Popconfirm
      title="Thông báo"
      description="Bạn chắc chứ"
      icon={<DeleteOutlined/>}
      onConfirm={()=>onDelete(id)}
      okText="OK"
      cancelText="NO"
      ><Button danger><DeleteOutlined/></Button></Popconfirm>
      </>
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

