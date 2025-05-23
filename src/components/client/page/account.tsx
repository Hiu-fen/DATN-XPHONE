import React, { useRef, useState } from 'react'

const Account = () => {
  const [user, setUser] = useState({
    id: 1,
    name: 'Phạm Hữu Hiếu',
    email: 'phamhieu12345@gmail.com',
    password: '',
    sdt: '0123456789',
    address: 'Hà Nội',
    avatar: 'https://picsum.photos/200',
    active: true,
    role: 'user',
    notification: 'Bạn có 1 thông báo mới',
    dob: '**/**/2025',
    gender: 'nam'
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setUser((prev) => ({ ...prev, avatar: imageUrl }))
    }
  }

  return (
    <div className="flex font-sans text-gray-800 bg-gray-100 p-10">
      {/* Sidebar */}
      <div className="w-60 p-5 border-r bg-white rounded-l-lg shadow-md">
        <div className="flex items-center mb-5">
          <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-full mr-3 object-cover" />
          <span className="font-bold text-lg">{user.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-10 bg-white rounded-r-lg shadow-md relative flex flex-col md:flex-row items-start gap-10">
        {/* Profile Info */}
        <div className="max-w-xl w-full">
          <h1 className="text-3xl font-bold mb-1">Hồ sơ của tôi</h1>
          <p className="text-gray-600 text-sm mb-8">Thông tin hồ sơ cá nhân</p>

          <div className="bg-white p-8 rounded-lg border border-gray-300 shadow-sm space-y-5">
            <InfoRow label="Tên đăng nhập" value={user.name} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="SĐT" value={user.sdt} />
            <InfoRow label="Địa chỉ" value={user.address} />
            <InfoRow label="Giới tính" value={user.gender === 'nam' ? 'Nam' : user.gender === 'nu' ? 'Nữ' : 'Khác'} />
            <InfoRow label="Vai trò" value={user.role} />
            <InfoRow label="Thông báo" value={user.notification} />
            <InfoRow
              label="Trạng thái"
              value={user.active ? 'Đang hoạt động' : 'Bị khóa'}
              className={user.active ? 'text-green-600' : 'text-red-600'}
            />
            <InfoRow label="Ngày sinh" value={user.dob} />
          </div>
        </div>

        {/* Avatar và nút chọn ảnh */}
        <div className="flex-shrink-0 text-center mt-[150px] ml-[70px]">
          <img
            src={user.avatar}
            alt="Ảnh đại diện"
            className="w-32 h-32 rounded-full object-cover border-4 border-[#ffcad4] shadow-xl mx-auto"
          />
          <p className="mt-2 text-gray-600 text-sm">Ảnh đại diện của bạn</p>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Chọn ảnh
          </button>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
        
      </div>
      
    </div>
    
  )
}

// Component hiển thị mỗi dòng thông tin
const InfoRow = ({
  label,
  value,
  className = ''
}: {
  label: string
  value: string
  className?: string
}) => (
  <div className="flex items-center">
    <label className="w-32 font-bold text-gray-700 text-right mr-4">{label}</label>
    <p className={`flex-grow p-2 bg-gray-100 rounded ${className}`}>{value}</p>
  </div>
)

export default Account
