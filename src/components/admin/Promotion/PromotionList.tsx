import { useQuery } from "@tanstack/react-query";
import { Button, Popconfirm, Table } from "antd";
import { Promotion } from "../../../interface/promotion";
import axios from "axios";
import { DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";

const GetPromotion = () => {
  const { data } = useQuery<Promotion[]>({
    queryKey: ['promotions'],
    queryFn: async () => {
      try {
        const response = await axios.get(`http://localhost:4000/promotions`)
        return response.data
      } catch (error) {
        console.log(error)
      }
    },
  })

  const onDelete = async () => {
    
  }

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
    },
        {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => (
        <span>
          {status ? 'Đang hoạt động' : 'Ngừng hoạt động'}
        </span>
      ),
    },
    {
      title: 'Thao tác',
      key: 'id',
      dataIndex: 'id',
      render: () => (
        <>
          <div className='flex justify-center items-center'>
              <Button className='mr-2' type="primary">
                  <EditOutlined />
              </Button>
              <Button className='mr-2' >
                  <EyeOutlined />
              </Button>
              <Popconfirm
                  title="Thông báo!!!"
                  description="Bạn chắc chắn xóa chứ?"
                  onConfirm={() => onDelete()}
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
    <div>
      <h1>Danh sách khuyến mãi</h1>
      <>
        <Table dataSource={data} columns={columns} pagination={false}/>
      </>
    </div>
  );
}

export default GetPromotion
