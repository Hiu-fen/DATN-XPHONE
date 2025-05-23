import { useRoutes } from 'react-router-dom'
import ClientLayout from './layout/client'
import AdminLayout from './layout/admin'
import GetList from './components/admin/Product/GetList'

import PutEdit from './components/admin/Product/PutEdit'
import Register from './components/client/Register'
import Login from './components/client/Login'

import CommentAdd from './components/admin/Comment/CommentAdd'
import GetListCategory from './components/admin/Category/GetListCategory'
import PostAddCategory from './components/admin/Category/PostAddCategory'
import PutEditCategory from './components/admin/Category/PutEditCategory'
import PostAdd from './components/admin/Product/PostAdd'
import CommentAdmin from './components/admin/Comment/CommentList'


import GetPromotion from './components/admin/Promotion/PromotionList'
import PostAddPromotion from './components/admin/Promotion/PromotionAdd'
import PutEditPromotion from './components/admin/Promotion/PromotionEdit'
import OrderList from './components/admin/Order/ListOrder'
import OrderDetail from './components/admin/Order/OrderDetail'

import ContactAdd from './components/admin/Contact/ContactAdd'
import ContactList from './components/admin/Contact/ContactList'
import BannerAdd from './components/admin/Banner/BannerAdd'
import BannerList from './components/admin/Banner/BannerList'
import BannerEdit from './components/admin/Banner/BannerEdit'

import PrivateRouteAdmin from './components/PrivateRouteAdmin'
import LoginAdmin from './components/admin/User/Login'
import RegisterAdmin from './components/admin/User/Register'
import GetAdmin from './components/admin/User/ListUserAdmin'
import ProfileAdmin from './components/admin/User/ProfileAdmin'
import GetClient from './components/admin/User/ListUserClient'

import DetailPromotion from './components/admin/Promotion/PromotionDetail'
import GetListAlbum from './components/admin/Album/GetListAlbum'
import PutEditAlbum from './components/admin/Album/PutEditAlbum'
import PostAddAlbum from './components/admin/Album/PostAddAlbum'
import AdminDashboard from './components/admin/Aside/AdminDashboard'

import useReloadIfBlank from './components/admin/Aside/useReloadIfBlank'
import About from './components/client/page/about'
import Home from './components/client/page/home'
import Contact from './components/client/page/contact'
import Cart from './components/client/page/cart'

import Categorys from './components/client/page/categorys'



const App = () => {
 useReloadIfBlank();
  const routes = useRoutes([

    {
      path: "/", element: <ClientLayout />, children: [
        { path: 'home', element: <Home /> },
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
        { path: 'about', element: <About /> },
        { path: 'contact', element: <Contact /> },
        { path: 'cart', element: <Cart/> },
        { path: 'categorys', element: <Categorys/> },
      ]
    },
    {
  path: "/admin/login",
  element: <LoginAdmin />
},
{
  path: "/admin/register",
  element: <RegisterAdmin />
},
    {
  path: "/admin",
  element: (
    <PrivateRouteAdmin>
      <AdminLayout />
    </PrivateRouteAdmin>
  ), children: [
  { index: true, element: <AdminDashboard /> }, 
        //Router Danh mục
        { path: 'category/list', element: <GetListCategory /> },
        { path: 'category/add', element: <PostAddCategory /> },
        { path: 'category/:id/edit', element: <PutEditCategory /> },

        //Router Sản phẩm
       { path: 'phone/list', element: <GetList /> },
        { path: 'phone/add', element: <PostAdd /> },
        { path: 'phone/:id/edit', element: <PutEdit /> },

        //Router Đăng ký, Đăng nhập
        { path: 'comment/list', element: <CommentAdmin /> },
        { path: 'comment/add', element: <CommentAdd /> },
        // {path:'login',element:<Login/>},

        /// Router quản lý tài khoản user
         { path: 'user/listadmin', element: <GetAdmin /> },
         { path: 'user/profileadmin', element: <ProfileAdmin /> },
         { path: 'user/listclient', element: <GetClient /> },



        //Router Order
        {path:'order/list', element:<OrderList/>},
        { path: 'order/:id', element: <OrderDetail /> },

        //Router Albums ảnh
        {path:'album/list', element:<GetListAlbum/>},
        {path:'album/add', element:<PostAddAlbum/>},
        { path:'album/edit/:id', element: <PutEditAlbum /> },
  
        

        /// Router quản lý Khuyễn mãi
        { path: 'promotion/list', element: <GetPromotion /> },
        { path: 'promotion/add', element: <PostAddPromotion /> },
        { path: 'promotion/edit/:id', element: <PutEditPromotion /> },
        { path: 'promotion/detail/:id', element: <DetailPromotion /> },

        /// Router quản lý lien he 
         { path: 'contact/add', element: <ContactAdd /> },
          { path: 'contact/list', element: <ContactList /> },

        /// Router quản lý banner
         { path: 'banner/add', element: <BannerAdd /> },
         { path: 'banner/list', element: <BannerList /> },
         { path: 'banner/edit/:id', element: <BannerEdit /> }
      ]
    },
  ])
  return routes
}

export default App