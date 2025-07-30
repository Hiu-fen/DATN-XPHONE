"use client"

import { UserOutlined, HomeOutlined, SettingOutlined, LockOutlined } from "@ant-design/icons"
import { useLocation, useNavigate } from "react-router-dom"

const AccountSiba = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname

  const menuItems = [
    {
      key: "user-manage",
      label: "Thông tin cá nhân",
      icon: <UserOutlined />,
      path: "/accounts/account",
    },
    {
      key: "AddressManager",
      label: "Quản lý địa chỉ",
      icon: <HomeOutlined />,
      path: "/accounts/my-addresses",
    },
    {
      key: "ChangePassword",
      label: "Đổi mật khẩu",
      icon: <LockOutlined />,
      path: "/accounts/change-password",
    },
  ]

  const isActive = (path: string) => pathname.startsWith(path)

  const handleClick = (path?: string) => {
    if (typeof path === "string") {
      if (path === pathname) {
        navigate(path, { state: { forceReload: Date.now() } })
      } else {
        navigate(path)
      }
    }
  }

  return (
    // Đã thay đổi từ "hidden lg:block" thành "block" để sidebar luôn hiển thị
    <aside className="w-64 flex-shrink-0 mr-8 p-6 bg-white rounded-xl shadow-lg block">
      <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-200">
        <div className="p-3 bg-blue-100 rounded-full">
          <SettingOutlined className="text-blue-700 text-xl" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Quản lý</h2>
          <p className="text-sm text-gray-500">Cài đặt tài khoản</p>
        </div>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <div
            key={item.key}
            className={`flex items-center space-x-3 p-3 rounded-lg text-lg font-medium transition-all duration-200 cursor-pointer
              ${
                isActive(item.path)
                  ? "bg-blue-100 text-blue-700 font-semibold shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:text-blue-700"
              }`}
            onClick={() => handleClick(item.path)}
          >
            <span className="text-xl flex items-center justify-center">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  )
}

export default AccountSiba
