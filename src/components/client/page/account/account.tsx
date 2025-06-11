import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import AccountSiba from './siba'
import { message } from 'antd'

const Account = () => {
  const [user, setUser] = useState<any>(null)
  const [originalUser, setOriginalUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showRegisterForm, setShowRegisterForm] = useState(false)

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    sdt: '',
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const localUser = localStorage.getItem('user')
    if (!localUser) return

    const { email } = JSON.parse(localUser)

    axios.get(`http://localhost:5000/api/users?email=${email}`)
      .then((res) => {
        const userData = res.data
        if (userData) {
          setUser(userData)
          setOriginalUser(userData)
        } else {
          message.error("Không tìm thấy người dùng. Vui lòng đăng nhập lại.")
          navigate('/login')
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy thông tin người dùng:", err)
        message.error("Lỗi kết nối server. Vui lòng thử lại sau.")
        navigate('/login')
      })
  }, [navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUser((prev: any) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "datn-xphone")
    formData.append("cloud_name", "dx3ffn8li")

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dx3ffn8li/image/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (data.secure_url) {
        setUser((prev: any) => ({ ...prev, avatar: data.secure_url }))
        message.success("Cập nhật ảnh đại diện thành công!")
      } else {
        message.error("Upload ảnh thất bại")
      }
    } catch (err) {
      console.error("Lỗi khi upload ảnh:", err)
      message.error("Có lỗi khi upload ảnh lên Cloudinary")
    }
  }

 const handleSave = async () => {
  if (!originalUser || !user) return

  const updatedFields: Partial<typeof user> = {}
  for (const key in user) {
    if (user[key] !== originalUser[key]) {
      updatedFields[key] = user[key]
    }
  }

  if (Object.keys(updatedFields).length === 0) {
    message.info("Không có thay đổi nào để lưu.")
    return
  }

  try {
    const { data: updatedUser } = await axios.patch(
      `http://localhost:5000/api/users/${user._id}`,
      updatedFields
    )

    setIsEditing(false)
    setOriginalUser(updatedUser)
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))

    message.success("Cập nhật thành công!")

    // 👉 Thêm dòng này để chuyển về trang /
    navigate("/")

    // 👉 Và reload lại trang để load dữ liệu mới
    setTimeout(() => {
      window.location.reload()
    }, 500) // Chờ một chút cho chắc
  } catch (error) {
    console.error("Lỗi cập nhật:", error)
    message.error("Cập nhật thất bại.")
  }
}


  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegisterData(prev => ({ ...prev, [name]: value }))
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:5000/api/user/register', {
        ...registerData,
        role: 'seller'
      })
      message.success("Đăng ký tài khoản bán hàng thành công! Vui lòng đăng nhập.")
      setShowRegisterForm(false)
      setRegisterData({ name: '', email: '', password: '', sdt: '' })
    } catch (error) {
      console.error('Lỗi đăng ký:', error)
      message.error("Đăng ký thất bại, vui lòng thử lại.")
    }
  }

  if (!user) {
    const localUser = localStorage.getItem('user')
    if (!localUser) {
      return (
        <div className="p-10 text-center">
          <p className="mb-4 text-red-600 font-semibold">Bạn chưa đăng nhập.</p>
          <Link to="/login" className="text-blue-600 underline hover:text-blue-800">
            Vui lòng đăng nhập tại đây
          </Link>
          <hr className="my-6" />
          {!showRegisterForm && (
            <p
              onClick={() => setShowRegisterForm(true)}
              className="cursor-pointer text-green-600 font-semibold underline hover:text-green-800"
            >
              Đăng ký tài khoản bán hàng
            </p>
          )}
          {showRegisterForm && (
            <form
              onSubmit={handleRegisterSubmit}
              className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-4"
            >
              <h2 className="text-2xl font-bold mb-4">Form đăng ký tài khoản bán hàng</h2>
              <input type="text" name="name" value={registerData.name} onChange={handleRegisterInputChange} placeholder="Tên đăng nhập" required className="w-full p-2 border border-gray-300 rounded" />
              <input type="email" name="email" value={registerData.email} onChange={handleRegisterInputChange} placeholder="Email" required className="w-full p-2 border border-gray-300 rounded" />
              <input type="password" name="password" value={registerData.password} onChange={handleRegisterInputChange} placeholder="Mật khẩu" required className="w-full p-2 border border-gray-300 rounded" />
              <input type="text" name="sdt" value={registerData.sdt} onChange={handleRegisterInputChange} placeholder="Số điện thoại" required className="w-full p-2 border border-gray-300 rounded" />
              <button type="submit" className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">Đăng ký</button>
              <button type="button" onClick={() => setShowRegisterForm(false)} className="w-full py-2 mt-2 bg-gray-300 rounded hover:bg-gray-400 transition">Hủy</button>
            </form>
          )}
        </div>
      )
    }
    return <p className="p-10">Đang tải dữ liệu...</p>
  }

  return (
    <div className="flex font-sans text-gray-800 bg-gray-100 p-10">
      <AccountSiba />
      <div className="flex-grow p-10 bg-white rounded-r-lg shadow-md relative flex flex-col md:flex-row items-start gap-10">
        <div className="max-w-xl w-full">
          <h1 className="text-3xl font-bold mb-1">Hồ sơ của tôi</h1>
          <p className="text-gray-600 text-sm mb-8">Thông tin hồ sơ cá nhân</p>
          <div className="bg-white p-8 rounded-lg border border-gray-300 shadow-sm space-y-5">
            <InfoRow label="Tên đăng nhập" name="name" value={user.name} editable={isEditing} onChange={handleChange} />
            <InfoRow label="Email" name="email" value={user.email} editable={isEditing} onChange={handleChange} />
            <InfoRow label="SĐT" name="sdt" value={user.sdt} editable={isEditing} onChange={handleChange} />
            <InfoRow label="Địa chỉ" name="address" value={user.address} editable={isEditing} onChange={handleChange} />
            <InfoRow label="Giới tính" name="gender" value={user.gender} editable={isEditing} onChange={handleChange} />
            <InfoRow label="Vai trò" name="role" value={user.role} editable={false} />
            <InfoRow label="Thông báo" name="notification" value={user.notification || 'Không có'} editable={false} />
            <InfoRow label="Trạng thái" name="active" value={user.active ? 'Đang hoạt động' : 'Bị khóa'} editable={false} className={user.active ? 'text-green-600' : 'text-red-600'} />
            <InfoRow label="Ngày sinh" name="dob" value={user.dob || ''} editable={isEditing} onChange={handleChange} />
            {isEditing ? (
              <button onClick={handleSave} className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">Lưu</button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">Chỉnh sửa</button>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-center mt-[150px] ml-[70px]">
          <img src={user.avatar || 'https://picsum.photos/200'} alt="Ảnh đại diện" className="w-32 h-32 rounded-full object-cover border-4 border-[#ffcad4] shadow-xl mx-auto" />
          <p className="mt-2 text-gray-600 text-sm">Ảnh đại diện của bạn</p>
          {isEditing && (
            <>
              <button onClick={() => fileInputRef.current?.click()} className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">Chọn ảnh</button>
              <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

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
      <input type="text" name={name} value={value} onChange={onChange} className="flex-grow p-2 bg-white border border-gray-300 rounded" />
    ) : (
      <p className={`flex-grow p-2 bg-gray-100 rounded ${className}`}>{value}</p>
    )}
  </div>
)

export default Account
