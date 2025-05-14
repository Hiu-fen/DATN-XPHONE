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

import Search from './components/admin/Search/search'

import GetPromotion from './components/admin/Promotion/PromotionList'
import PostAddPromotion from './components/admin/Promotion/PromotionAdd'
import PutEditPromotion from './components/admin/Promotion/PromotionEdit'



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


        //Router Search
        {path:'search', element:<Search/>},

        /// Router quản lý Khuyễn mãi
        { path: 'promotion/list', element: <GetPromotion /> },
        { path: 'promotion/add', element: <PostAddPromotion /> },
        { path: 'promotion/:id/edit', element: <PutEditPromotion /> },

      ]
    },
  ])
  return routes
}

export default App