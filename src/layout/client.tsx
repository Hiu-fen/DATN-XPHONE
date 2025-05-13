import React from 'react'
import ClientHeader from '../components/client/header'
import ClientFooter from '../components/client/footer'
import { Outlet } from 'react-router-dom'

const ClientLayout = () => {
  return (
    <>
        <ClientHeader/>
        <div className='max-w-7xl mx-auto'>
          <Outlet/>
          </div>
        <ClientFooter/>
    </>
  )
}

export default ClientLayout