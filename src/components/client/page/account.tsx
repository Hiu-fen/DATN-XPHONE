import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const Account = () => {
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const localUser = localStorage.getItem('user')
    if (!localUser) return

    const { email } = JSON.parse(localUser)

    axios.get(`http://localhost:4000/users?email=${email}`)
      .then((res) => {
        if (res.data.length > 0) {
          setUser(res.data[0])
        } else {
          alert("Không tìm thấy người dùng")
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy thông tin người dùng:", err)
      })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUser((prev: any) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setUser((prev: any) => ({ ...prev, avatar: imageUrl }))
    }
  }

  const handleSave = async () => {
    try {
      await axios.patch(`http://localhost:4000/users/${user.id}`, user)
      alert("Cập nhật thành công!")
      setIsEditing(false)
    } catch (error) {
      console.error("Lỗi cập nhật:", error)
      alert("Cập nhật thất bại.")
    }
  }

  if (!user){
      const localUser = localStorage.getItem('user')
  if (!localUser) {
    return (
      <div className="p-10 text-center">
        <p className="mb-4 text-red-600 font-semibold">Bạn chưa đăng nhập.</p>
        <Link 
          to="/login" 
          className="text-blue-600 underline hover:text-blue-800"
        >
          Vui lòng đăng nhập tại đây
        </Link>
      </div>
    )
  }
  return <p className="p-10">Đang tải dữ liệu...</p>

  } 
  return (
    <div className="flex font-sans text-gray-800 bg-gray-100 p-10">
      {/* Sidebar */}
      <div className="w-60 p-5 border-r bg-white rounded-l-lg shadow-md">
        <div className="flex items-center mb-5">
          <img src={user.avatar || 'https://picsum.photos/200'} alt="Avatar" className="w-12 h-12 rounded-full mr-3 object-cover" />
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
            <InfoRow label="Tên đăng nhập" name="name" value={user.name} editable={isEditing} onChange={handleChange} />
            <InfoRow label="Email" name="email" value={user.email} editable={false} />
            <InfoRow label="SĐT" name="sdt" value={user.sdt} editable={isEditing} onChange={handleChange} />
            <InfoRow label="Địa chỉ" name="address" value={user.address} editable={isEditing} onChange={handleChange} />
            <InfoRow label="Giới tính" name="gender" value={user.gender} editable={isEditing} onChange={handleChange} />
            <InfoRow label="Vai trò" name="role" value={user.role} editable={false} />
            <InfoRow label="Thông báo" name="notification" value={user.notification || 'Không có'} editable={false} />
            <InfoRow
              label="Trạng thái"
              name="active"
              value={user.active ? 'Đang hoạt động' : 'Bị khóa'}
              editable={false}
              className={user.active ? 'text-green-600' : 'text-red-600'}
            />
            <InfoRow label="Ngày sinh" name="dob" value={user.dob || ''} editable={isEditing} onChange={handleChange} />

            {isEditing ? (
              <button
                onClick={handleSave}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Lưu
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
              >
                Chỉnh sửa
              </button>
            )}
          </div>
        </div>

        {/* Avatar */}
        <div className="flex-shrink-0 text-center mt-[150px] ml-[70px]">
          <img
            src={user.avatar || 'https://picsum.photos/200'}
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
  name,
  onChange,
  editable,
  className = ''
}: {
  label: string
  value: string
  name: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  editable?: boolean
  className?: string
}) => (
  <div className="flex items-center">
    <label className="w-32 font-bold text-gray-700 text-right mr-4">{label}</label>
    {editable ? (
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="flex-grow p-2 bg-white border border-gray-300 rounded"
      />
    ) : (
      <p className={`flex-grow p-2 bg-gray-100 rounded ${className}`}>{value}</p>
    )}
  </div>
)

export default Account
