import ClientHeader from '../components/client/layout/header'
import ClientFooter from '../components/client/layout/footer'
import { Outlet } from 'react-router-dom'

const ClientLayout = () => {
  return (
    <>
        <ClientHeader/>
        <div className='max-w-screen-xl mx-auto'>
        {/* <div className=''> */}
          <Outlet/>
          </div>
        <ClientFooter/>
    </>
  )
}

export default ClientLayout