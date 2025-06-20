import { Link } from 'react-router-dom';
import { HomeOutlined, MenuOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';

export default function NavIcons() {
  return (
    <>
      <div className="hidden md:flex items-center gap-4">
        <Link to="/">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Tooltip title="Về trang chủ">
              <HomeOutlined className="text-gray-600" style={{ fontSize: 20 }} />
            </Tooltip>
          </button>
        </Link>
      </div>

      {/* <Link to="#">
        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <SettingOutlined className="text-gray-600" style={{ fontSize: 20 }} />
        </button>
      </Link> */}

      <button className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors">
        <MenuOutlined className="text-gray-600" style={{ fontSize: 22 }} />
      </button>
    </>
  );
}
