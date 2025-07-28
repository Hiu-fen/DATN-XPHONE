"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { message } from "antd"
import AccountSiba from "./siba" // Ensure this path is correct

const Account = () => {
  const [user, setUser] = useState<any>(null)
  const [originalUser, setOriginalUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const localUser = localStorage.getItem("user")
    if (!localUser) {
      setIsLoading(false)
      return
    }

    const { email } = JSON.parse(localUser)
    axios
      .get(`http://localhost:5000/api/users?email=${email}`)
      .then((res) => {
        const userData = res.data
        setUser(userData)
        setOriginalUser(userData)
        setIsLoading(false)
      })
      .catch(() => {
        setIsLoading(false)
        navigate("/login")
      })
  }, [navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setUser((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingImage(true)
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
      }
    } catch (error) {
      message.error("Không thể tải lên ảnh. Vui lòng thử lại.")
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSave = async () => {
    if (!user || !originalUser) return

    setIsSaving(true)
    const updatedFields: any = {}

    for (const key in user) {
      if (user[key] !== originalUser[key]) {
        updatedFields[key] = user[key]
      }
    }

    if (Object.keys(updatedFields).length === 0) {
      message.info("Không có thay đổi nào để lưu")
      setIsEditing(false)
      setIsSaving(false)
      return
    }

    try {
      const { data } = await axios.put(`http://localhost:5000/api/users/profile/${user._id}`, updatedFields)

      const updatedUser = data.user // ✅ lấy đúng user từ backend trả về

      setUser(updatedUser)
      setOriginalUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser)) // ✅ lưu chính xác
      setIsEditing(false)
      message.success("Cập nhật thông tin thành công!")
    } catch (error) {
      message.error("Cập nhật thất bại. Vui lòng thử lại.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setUser(originalUser)
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-lg font-medium text-slate-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex flex-col lg:flex-row font-sans text-gray-800 p-4 lg:p-8 gap-6">
        <AccountSiba />

        <div className="flex-grow">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Hồ sơ của tôi</h1>
                  <p className="text-blue-100">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
                </div>

                <div className="flex items-center space-x-3">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium disabled:opacity-50 backdrop-blur-sm border border-white/30"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium disabled:opacity-50 flex items-center space-x-2 shadow-lg"
                      >
                        {isSaving && (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                        )}
                        <span>{isSaving ? "Đang lưu..." : "Lưu thay đổi"}</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2.5 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium shadow-lg flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <span>Chỉnh sửa</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="flex flex-col xl:flex-row gap-8">
                {/* Avatar Section */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-white shadow-2xl bg-gradient-to-br from-blue-400 to-purple-500 p-1">
                      <img
                        src={
                          user.avatar ||
                          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover bg-white"
                      />
                    </div>

                    {isEditing && (
                      <div
                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {isUploadingImage ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-3 border-white border-t-transparent"></div>
                        ) : (
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        )}
                      </div>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>

                  <div className="mt-4 text-center">
                    <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
                    <p className="text-slate-600 text-sm mt-1">{user.email}</p>
                    <div className="flex items-center justify-center mt-3 space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.active
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {user.active ? "🟢 Đang hoạt động" : "🔴 Bị khóa"}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                        🛡️ {user.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Section */}
                <div className="flex-grow">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="space-y-6">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-blue-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Thông tin cá nhân
                        </h3>
                      </div>

                      <InfoRow
                        label="Tên đăng nhập"
                        name="name"
                        value={user.name}
                        editable={isEditing}
                        onChange={handleChange}
                        icon="👤"
                      />

                      <InfoRow
                        label="Email"
                        name="email"
                        value={user.email}
                        editable={isEditing}
                        onChange={handleChange}
                        icon="📧"
                      />

                      {isEditing ? (
                        <GenderRow value={user.gender || ""} onChange={handleChange} />
                      ) : (
                        <InfoRow
                          label="Giới tính"
                          name="gender"
                          value={user.gender || "Chưa cập nhật"}
                          editable={false}
                          icon="⚧️"
                        />
                      )}

                      <InfoRow
                        label="Ngày sinh"
                        name="dob"
                        value={user.dob ? new Date(user.dob).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                        editable={isEditing}
                        onChange={handleChange}
                        type="date"
                        rawValue={user.dob}
                        icon="🎂"
                      />
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-6">
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-purple-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          Thông tin liên hệ
                        </h3>
                      </div>

                      <InfoRow
                        label="Số điện thoại"
                        name="sdt"
                        value={user.sdt || "Chưa cập nhật"}
                        editable={false}
                        icon="📱"
                        actionButton={
                          isEditing
                            ? {
                                text: "Cập nhật",
                                onClick: () => navigate("/accounts/my-addresses"),
                              }
                            : undefined
                        }
                      />

                      <InfoRow
                        label="Địa chỉ"
                        name="address"
                        value={user.address || "Chưa cập nhật"}
                        editable={false}
                        icon="📍"
                        actionButton={
                          isEditing
                            ? {
                                text: "Cập nhật",
                                onClick: () => navigate("/accounts/my-addresses"),
                              }
                            : undefined
                        }
                      />

                      <InfoRow label="Vai trò" name="role" value={user.role} editable={false} icon="🛡️" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ========== COMPONENTS ==========
const InfoRow = ({
  label,
  value,
  name,
  onChange,
  editable,
  className = "",
  icon,
  actionButton,
  type = "text",
  rawValue,
}: {
  label: string
  value: string
  name: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  editable?: boolean
  className?: string
  icon?: string
  actionButton?: { text: string; onClick: () => void }
  type?: string
  rawValue?: string
}) => (
  <div className="group">
    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </label>
    <div className="relative">
      {editable ? (
        <input
          type={type}
          name={name}
          value={type === "date" ? rawValue || "" : value}
          onChange={onChange}
          className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-slate-800 placeholder-slate-400"
          placeholder={`Nhập ${label.toLowerCase()}`}
        />
      ) : (
        <div
          className={`w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-800 ${className} flex items-center justify-between group-hover:bg-slate-100 transition-all duration-200`}
        >
          <span className="flex-1">{value}</span>
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              className="ml-3 px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              {actionButton.text}
            </button>
          )}
        </div>
      )}
    </div>
  </div>
)

const GenderRow = ({
  value,
  onChange,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}) => (
  <div className="group">
    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center">
      <span className="mr-2">⚧️</span>
      Giới tính
    </label>
    <select
      name="gender"
      value={value}
      onChange={onChange}
      className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-slate-800"
    >
      <option value="">-- Chọn giới tính --</option>
      <option value="Nam">👨 Nam</option>
      <option value="Nữ">👩 Nữ</option>
      <option value="Không muốn tiết lộ">🤐 Không muốn tiết lộ</option>
    </select>
  </div>
)

export default Account
