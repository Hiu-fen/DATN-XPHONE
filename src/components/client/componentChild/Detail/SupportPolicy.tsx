// src/pages/client/componentChild/Detail/SupportPolicy.tsx
import {
  TruckOutlined,
  GiftOutlined,
  CheckOutlined,
  PhoneOutlined,
  StarOutlined,
} from "@ant-design/icons";

const SupportPolicy = () => {
  const policies = [
    {
      icon: <TruckOutlined className="text-xl text-gray-600" />,
      title: "Vận chuyển miễn phí",
      desc: "Đơn hàng từ 2 triệu",
    },
    {
      icon: <GiftOutlined className="text-xl text-gray-600" />,
      title: "Quà tặng",
      desc: "Ưu đãi đặc biệt theo mùa",
    },
    {
      icon: <CheckOutlined className="text-xl text-gray-600" />,
      title: "Cam kết chất lượng",
      desc: "100% chính hãng",
    },
    {
      icon: <PhoneOutlined className="text-xl text-gray-600" />,
      title: "Hotline: 0789182477",
      desc: "Hỗ trợ từ 8h - 22h",
    },
  ];

  return (
    <div className="bg-white rounded-md shadow-sm border border-gray-800">
      <div className="bg-gray-900 text-white px-3 py-1.5 flex items-center gap-2 font-semibold text-base justify-center rounded-t-md">
        <StarOutlined className="text-lg" />
        <span>Chính sách hỗ trợ</span>
      </div>
      <table className="w-full text-sm border-separate border-spacing-y-1 px-3 py-2">
        <tbody>
          {policies.map((item, idx) => (
            <tr key={idx} className="bg-gray-50 rounded-md">
              <td className="w-10 text-center py-2 align-top">{item.icon}</td>
              <td className="py-2 align-top">
                <div>
                  <span className="font-semibold">{item.title}</span>
                  <br />
                  <span className="text-xs text-gray-500">{item.desc}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupportPolicy;
