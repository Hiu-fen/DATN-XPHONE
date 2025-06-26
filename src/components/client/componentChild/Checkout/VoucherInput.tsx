import { useState } from "react";
import { Input, Button, Divider } from "antd";
import { DownOutlined, UpOutlined, TagOutlined } from "@ant-design/icons";

const VoucherInput = ({ onApply }: { onApply: (code: string) => void }) => {
  const [code, setCode] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleApply = () => {
    if (code.trim()) {
      onApply(code.trim());
    }
  };

  const toggleForm = () => setShowForm(!showForm);

  return (
    <div className="mt-3 rounded-md overflow-hidden border border-green-600">
      {/* Header Toggle */}
      <div
        onClick={toggleForm}
        className="flex justify-between items-center px-4 py-3 bg-green-600 cursor-pointer"
      >
        <span className="text-base font-medium text-white">
          Mã Giảm Giá
        </span>
        <span className="text-white font-medium text-sm flex items-center gap-1">
          Nhập mã tại đây {showForm ? <UpOutlined /> : <DownOutlined />}
        </span>
      </div>

      {showForm && (
        <>
          <Divider className="!my-0" />
          <div className="p-4 bg-white">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  prefix={<TagOutlined />}
                  placeholder="Nhập mã khuyến mãi"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="bg-gray-50 py-2.5"
                />
              </div>
              <div className="sm:w-40 w-full">
                <Button
                  type="primary"
                  onClick={handleApply}
                  className="w-full py-2.5 font-medium bg-green-600 border-green-600 hover:!bg-green-700 hover:!border-green-700"
                >
                  Áp dụng
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VoucherInput;
