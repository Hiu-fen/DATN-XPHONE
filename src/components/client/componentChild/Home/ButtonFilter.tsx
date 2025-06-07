import { FiCheckCircle, FiGift, FiHeadphones, FiTruck } from 'react-icons/fi';

const filterOptions = [
  { text: "Vận chuyển", icon: <FiTruck /> },
  { text: "Quà tặng", icon: <FiGift /> },
  { text: "Chứng nhận", icon: <FiCheckCircle /> },
  { text: "Hỗ trợ", icon: <FiHeadphones /> },
];

const ButtonFilter = () => (
  <div className="mx-24 flex space-x-4 py-8">
    {filterOptions.map(({ text, icon }) => (
      <button
        key={text}
        className="flex-1 px-4 py-4 rounded-full border-gray-400 border hover:shadow transition-shadow duration-300 flex items-center justify-center gap-2"
      >
        {icon}
        {text}
      </button>
    ))}
  </div>
);

export default ButtonFilter;
