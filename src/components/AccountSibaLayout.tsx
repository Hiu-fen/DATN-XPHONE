// src/layouts/AccountSibaLayout.tsx
import { Outlet } from 'react-router-dom'

const AccountSibaLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Bố cục, header/sidebar ở đây nếu có */}
      <Outlet />
    </div>
  )
}

export default AccountSibaLayout