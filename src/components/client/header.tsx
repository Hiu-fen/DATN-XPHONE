import React from 'react'

const ClientHeader = () => {
  return (
    <header className='bg-green-900 text-white'>
        <div className='max-w-7xl mx-auto flex justify-between items-center'>
            <div>LOGO</div>
            <div className='flex justify-between w-full py-4'>
                <form className='pl-10 relative'>
                    <input className='outline-0 text-black px-3 py-1 w-[300px] rounded' type='text' placeholder='Tìm kiếm'/>
                    <button className='absolute top-2 right-2'>
                    <svg className='w-5 h-5' fill='#999' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
                    </button>
                </form>
                <nav>
                    <ul className='flex gap-4'>
                        <li>Trang chủ</li>
                        <li>Giới thiệu</li>
                        <li>Shop</li>
                        <li>Tin tức</li>
                        <li>Liên hệ</li>
                    </ul>
                </nav>
            </div>
        </div>
    </header>
  )
}

export default ClientHeader