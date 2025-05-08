import React from 'react'

const AdminHeader = () => {
  return (
    <header className='bg-white w-full shadow-md flex p-4 relative z-50'>
        <div className='logo w-1/5'>XPhone</div>
        <div className='right-header w-4/5 flex justify-between'>
            <form>
                <input className='border rounded-md w-[350px] px-2 py-1' type='text' placeholder='Tìm kiếm'/>
            </form>
            <ul>
                <li>Xin chào admin</li>
            </ul>
        </div>
    </header>
  )
}

export default AdminHeader