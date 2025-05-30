import ClientHeader from '../components/client/header'
import ClientFooter from '../components/client/footer'
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