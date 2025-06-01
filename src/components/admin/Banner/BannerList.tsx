import React, { useEffect, useState } from 'react';
import { Table, Button, message, Input } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { IBanner } from '../../../interface/banner';  // Đảm bảo import interface đúng

// Thêm dòng này để mở rộng IBanner nếu chưa có _id
interface IBannerWithId extends IBanner {
  _id: string;
}

const BannerList = () => {
  const [banners, setBanners] = useState<IBannerWithId[]>([]);  // State lưu trữ danh sách banner
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');


  // Hàm lấy danh sách banner từ API
  const fetchBanners = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/banners');
      setBanners(response.data);  // Lưu dữ liệu vào state
    } catch (error) {
      message.error('Không thể tải danh sách banner, vui lòng thử lại!');
    }
  };

  // Sử dụng useEffect để gọi hàm fetch khi component được render
  useEffect(() => {
    fetchBanners();
  }, []);

  // Hàm xử lý thay đổi trạng thái banner
  const toggleStatus = async (_id: string, currentStatus: boolean) => {
    try {
      const updatedStatus = !currentStatus;
      await axios.put(`http://localhost:5000/api/banners/${_id}`, { status: updatedStatus });
      // Cập nhật lại danh sách sau khi thay đổi trạng thái
      setBanners((prevBanners) => prevBanners.map(banner => 
        banner._id === _id ? { ...banner, status: updatedStatus } : banner
      ));
      message.success('Thay đổi trạng thái thành công!');
    } catch (error) {
      message.error('Không thể thay đổi trạng thái, vui lòng thử lại!');
    }
  };

  // Hàm xử lý xóa banner
  const deleteBanner = async (_id: string) => {
    try {
      await axios.delete(`http://localhost:5000/api/banners/${_id}`);
      // Xoá banner khỏi danh sách trong state
      setBanners((prevBanners) => prevBanners.filter(banner => banner._id !== _id));
      message.success('Xoá banner thành công!');
    } catch (error) {
      message.error('Không thể xoá banner, vui lòng thử lại!');
    }
  };
  const search = banners?.filter((c: IBannerWithId) => {
    const Text = `${c._id} ${c.name}  `.toLowerCase();
    return Text.includes(searchText.toLowerCase());
  });

  // Cấu hình các cột trong bảng
  const columns = [
    {
      title: 'STT',
      key: 'stt',
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Tên Banner',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (image: string) => <img src={image} alt="banner" style={{ width: 100, height: 60 }} />
    },
    {
      title: 'Link sự kiện',
      dataIndex: 'link',
      key: 'link',
      render: (link: string) => <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
    },
    {
      title: 'Thời gian',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (start_date: string, record: IBannerWithId) => `${start_date} - ${record.end_date}`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => (status ? 'Hiển thị' : 'Ẩn'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: IBannerWithId) => (
        <span>
          <Button 
            onClick={() => toggleStatus(record._id, record.status)} 
            style={{ marginRight: 8 }}
          >
            {record.status ? 'Ẩn ' : 'Hiển thị '}
          </Button>
          <Button 
            onClick={() => navigate(`/admin/banner/edit/${record._id}`)} 
            style={{ marginRight: 8 }}
          >
            Sửa
          </Button>
          <Button 
            onClick={() => deleteBanner(record._id)} 
            danger>
            Xoá
          </Button>
        </span>
      ),
    },
  ];

  return (
    <div className="container mt-10">
      <h2 className="text-2xl font-bold ">Danh sách Banner</h2>
       <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
       <Input.Search
        placeholder=""
        className="mb-4"
         style={{ width: 300 }} 
        onChange={(e) => setSearchText(e.target.value)}
        allowClear
      />
      </div>
      <Table
        columns={columns}
        dataSource={search}
        rowKey="_id"
        pagination={{
        pageSize: 10, 
        showSizeChanger: false,
        pageSizeOptions: ['10', '20', '30'],
      }}
      />
    </div>
  );
};

export default BannerList;
