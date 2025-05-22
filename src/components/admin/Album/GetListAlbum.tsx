import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, message, Popconfirm, Table, Modal, Input } from 'antd'
import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Ialbums } from '../../../interface/albums'
import AlbumImage from './AlbumImage'; // đường dẫn bạn chỉnh lại theo dự án


const GetListAlbum = () => {
  const [searchText, setSearchText] = useState('');
  const nav = useNavigate();
  const { data, refetch } = useQuery({
    queryKey: ['albums'],
    queryFn: async () => (await axios.get(`http://localhost:4000/albums`)).data
  })

  // Xóa album
  const mutationDelete = useMutation({
    mutationFn: async (id: string) => await axios.delete(`http://localhost:4000/albums/${id}`),
    onSuccess: () => {
      message.success("Xóa thành công")
      refetch()
    }
  })
  const onDelete = (id: string) => {
    mutationDelete.mutate(id)
  }

  // State mở modal đổi ảnh
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Mở modal đổi ảnh
  const openChangeImageModal = (id: string) => {
    setCurrentAlbumId(id);
    setIsModalOpen(true);
    setSelectedFile(null);
  };

  // Đóng modal
  const handleCancel = () => {
    setIsModalOpen(false);
    setCurrentAlbumId(null);
    setSelectedFile(null);
  };

  // Chọn file ảnh mới
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Cập nhật ảnh mới
  const mutationUpdateImage = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!currentAlbumId) throw new Error("Không có album để cập nhật");
      return await axios.patch(`http://localhost:4000/albums/${currentAlbumId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      message.success("Cập nhật ảnh thành công");
      refetch();
      handleCancel();
    },
    onError: () => {
      message.error("Cập nhật ảnh thất bại");
    }
  });


  const handleUpload = () => {
    if (!selectedFile) {
      message.warning("Vui lòng chọn ảnh mới");
      return;
    }
    const formData = new FormData();
    formData.append('image', selectedFile);
    mutationUpdateImage.mutate(formData);
  };
  const search = data?.filter((c: Ialbums) => {
    const Text = `${c.id} ${c.name}  `.toLowerCase();
    return Text.includes(searchText.toLowerCase());
  });

 
  const columns = [
    {
      title: "Stt",
      key: 'stt',
      render: (_: any, __: Ialbums, index: number) => index + 1
    },
    {
      title: "Tên Album",
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: "Mô tả",
      key: 'description',
      dataIndex: 'description',
    },
  {
  title: "Ảnh minh họa",
  key: 'image',
  dataIndex: 'image',
  render: (img: string, record: Ialbums) => (
    <AlbumImage images={img} alt={record.name} />
  )
},
    {
      title: "Thao tác",
      key: 'id',
      dataIndex: 'id',
      render: (id: string) => (
        <>
          <Button onClick={() => nav(`/admin/album/edit/${id}`)}><EditOutlined /></Button>
          <Popconfirm
            title="Xác nhận"
            description="Bạn có chắc chắn muốn xóa album này?"
            onConfirm={() => onDelete(id)}
            okText="OK"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger><DeleteOutlined /></Button>
          </Popconfirm>
        </>
      )
    },
  ];

  return (
    <div>
     <h2 className="text-2xl font-bold ">Danh sách Album</h2>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Input.Search
          placeholder=""
          className="mb-4"
          style={{ width: 300 }} 
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Table dataSource={search} columns={columns} rowKey="id" 
        pagination={{
        pageSize: 10, 
        showSizeChanger: false,
        pageSizeOptions: ['5', '10', '20'],
      }}
      />

      {/* Modal đổi ảnh */}
      <Modal
        title="Đổi ảnh album"
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleUpload}
        okText="Cập nhật"
        cancelText="Hủy"
        okButtonProps={{ disabled: !selectedFile }}
      >
        <input
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.gif"
          onChange={handleFileChange}
        />
        {selectedFile && (
          <div style={{ marginTop: 10 }}>
            <strong>Ảnh chọn:</strong>
            <br />
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="preview"
              style={{ width: 150, height: 150, objectFit: 'cover', borderRadius: 6, border: '1px solid #ddd' }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GetListAlbum;
