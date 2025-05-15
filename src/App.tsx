import { useRoutes } from 'react-router-dom'
import ClientLayout from './layout/client'
import AdminLayout from './layout/admin'
import GetList from './components/admin/Product/GetList'

import PutEdit from './components/admin/Product/PutEdit'
import Register from './components/client/Register'
import Login from './components/client/Login'

import CommentAdd from './components/admin/Comment/CommentAdd'
import GetUser from './components/admin/User/ListUsers'
import GetListCategory from './components/admin/Category/GetListCategory'
import PostAddCategory from './components/admin/Category/PostAddCategory'
import PutEditCategory from './components/admin/Category/PutEditCategory'
import PostAdd from './components/admin/Product/PostAdd'
import CommentAdmin from './components/admin/Comment/CommentList'
import ContactAdd from './components/admin/Contact/ContactAdd'
import ContactList from './components/admin/Contact/ContactList'
import BannerAdd from './components/admin/Banner/BannerAdd'
import BannerList from './components/admin/Banner/BannerList'
import BannerEdit from './components/admin/Banner/BannerEdit'


const App = () => {
  const routes = useRoutes([

    {
      path: "/", element: <ClientLayout />, children: [
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
      ]
    },
    {
      path: "/admin", element: <AdminLayout />, children: [

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
        { path: 'user/list', element: <GetUser /> },

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