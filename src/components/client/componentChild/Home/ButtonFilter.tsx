import { useState } from 'react';
import { FiCheckCircle, FiGift, FiHeadphones, FiTruck } from 'react-icons/fi';

const filterOptions = [
  { text: "Vận chuyển", icon: <FiTruck /> },
  { text: "Quà tặng", icon: <FiGift /> },
  { text: "Chứng nhận", icon: <FiCheckCircle /> },
  { text: "Hỗ trợ", icon: <FiHeadphones /> },
];

const ButtonFilter = () => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="mx-4 md:mx-24 flex flex-wrap gap-4 py-8 justify-center">
      {filterOptions.map(({ text, icon }) => {
        const isSelected = selected === text;
        return (
          <button
            key={text}
            onClick={() => setSelected(isSelected ? null : text)}
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-full border 
              ${isSelected ? 'bg-green-500 text-white border-green-600 shadow-lg' : 'border-gray-300 text-gray-700 hover:shadow-md'} 
              transition-all duration-300 flex items-center justify-center gap-2`}
          >
            {icon}
            {text}
          </button>
        );
      })}
    </div>
  );
};

export default ButtonFilter;
