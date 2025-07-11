import { useRoutes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ClientLayout from './layout/client';
import AdminLayout from './layout/admin';
import GetList from './components/admin/Product/GetList';

import PutEdit from './components/admin/Product/PutEdit';
import Register from './components/client/Register';
import Login from './components/client/Login';

import CommentAdd from './components/admin/Comment/CommentAdd';
import CommentAdmin from './components/admin/Comment/CommentList';

import GetListCategory from './components/admin/Category/GetListCategory';
import PostAddCategory from './components/admin/Category/PostAddCategory';
import PutEditCategory from './components/admin/Category/PutEditCategory';
import PostAdd from './components/admin/Product/PostAdd';

import GetPromotion from './components/admin/Promotion/PromotionList';
import PostAddPromotion from './components/admin/Promotion/PromotionAdd';
import PutEditPromotion from './components/admin/Promotion/PromotionEdit';
import OrderList from './components/admin/Order/ListOrder';
import OrderDetail from './components/admin/Order/OrderDetail';

import ContactAdd from './components/admin/Contact/ContactAdd';
import ContactList from './components/admin/Contact/ContactList';
import BannerAdd from './components/admin/Banner/BannerAdd';
import BannerList from './components/admin/Banner/BannerList';
import BannerEdit from './components/admin/Banner/BannerEdit';
import BannerDetail from './components/admin/Banner/BannerDetail';

import PrivateRouteAdmin from "./components/PrivateRouteAdmin";
import LoginAdmin from "./components/admin/User/Login";
import RegisterAdmin from "./components/admin/User/Register";
import GetAdmin from "./components/admin/User/ListUserAdmin";
import ProfileAdmin from "./components/admin/User/ProfileAdmin";
import GetClient from "./components/admin/User/ListUserClient";

import DetailPromotion from './components/admin/Promotion/PromotionDetail'

import AdminDashboard from './components/admin/Aside/AdminDashboard'

import useReloadIfBlank from "./components/admin/Aside/useReloadIfBlank";
import About from "./components/client/page/about/about";
import Home from "./components/client/page/UI/home";
import Contact from "./components/client/page/contact/contact";
import Product from "./components/client/page/product/product";


import Categorys from './components/client/page/category/categorys';
import CategoryDetail from './components/client/page/category/CategoryDetail';
import Cart from './components/client/page/cart/cart';
import Account from './components/client/page/account/account';
import Details from './components/client/page/UI/details';
import ProductDetail from './components/admin/Product/Detail';
import AccountSibaLayout from './components/AccountSibaLayout';
// import AccountSiba from './components/client/page/account/siba';
import AddAccountAdmin from './components/client/page/account/add-admin';
import { CartProvider } from './components/client/context/CartContext';
import Checkout from './components/client/page/checkout/checkoutCart';
import { UserProvider } from './components/client/context/UserContext';



import ColorAdd from './components/admin/Variant/color/ColorAdd';
import ColorEdit from './components/admin/Variant/color/ColorEdit';
import RamAdd from './components/admin/Variant/ram/RamAdd';
import RamEdit from './components/admin/Variant/ram/RamEdit';
import VariantList from './components/admin/Variant/variantList';
import NotFound from './components/client/page/UI/notfound';
import AddressManager from './components/client/page/account/AddressManager';
// import VariantList from './components/admin/Variant/VariantList';

import NewsList from './components/admin/News/NewsList';
import NewsAdd from './components/admin/News/NewsAdd';
import NewsEdit from './components/admin/News/NewsEdit';
import NewsClient from './components/client/page/new/news';
import NewsDetail from './components/client/page/new/NewsDetail';
import Notification from './components/client/page/UI/Notification';
import Wishlist from './components/client/page/UI/Wishlist';
import Deleted_products from './components/admin/Product/Deleted-products';
import OrderHistory from './components/client/page/order/history';
import OrderDetailClient from './components/client/page/order/orderDetailClient';
import VnpayReturn from './components/client/page/checkout/VnpayReturn';
import ReturnDetail from './components/admin/Order/ReturnDetail';
import ReturnRequestDetail from './components/client/page/order/ReturnDetail';
import PromotionPageClient from './components/client/page/promotion/PromotionPageClient';
import CodReturn from './components/client/page/checkout/CodReturn';
import NotificationAdmin from './components/admin/ComponentCon/Header/Setting';

const App = () => {
  useReloadIfBlank();
  const routes = useRoutes([
    {
      path: "/",
      element: <ClientLayout />,
      children: [
        { path: "/", element: <Home /> },
        { path: "about", element: <About /> },
        { path: "contact", element: <Contact /> },
        { path: "promotion", element: <PromotionPageClient /> },
        { path: "cart/:id", element: <Cart /> },
        { path: "checkout", element: <Checkout /> },
        { path: "vnpay_return", element: <VnpayReturn /> },
        { path: "cod_return", element: <CodReturn /> },
        { path: 'detail/:id', element: <Details /> },
        { path: "categorys", element: <Categorys /> },
        { path: "category/:id", element: <CategoryDetail /> },
        { path: "news", element: <NewsClient /> },
        { path: "news/:id", element: <NewsDetail /> },
        { path: 'history', element: <OrderHistory /> },
        { path: "history/:id", element: <OrderDetailClient /> },
        // Trả hàng
        { path: "return/:id", element: <ReturnRequestDetail /> },
        {
          path: "accounts",
          element: <AccountSibaLayout />,
          children: [
            { index: true, element: <Account /> }, // ✅ Đây là mặc định
            { path: "account", element: <Account /> },
            { path: "addaccountadmin", element: <AddAccountAdmin /> },
            { path: "my-addresses", element: <AddressManager /> },
          ],
        },
        { path : "notification" , element : <Notification/>},
        { path : "wishlist" , element : <Wishlist/>},

        { path: "product", element: <Product /> },
      ],
    },
    { path: "*", element: <NotFound type="client" /> },
    { path: "login", element: <Login /> },
    { path: "register", element: <Register /> },
    {
      path: "/admin/login",
      element: <LoginAdmin />,
    },
    {
      path: "/admin/register",
      element: <RegisterAdmin />,
    },
    {
      path: "/admin",
      element: (
        <PrivateRouteAdmin>
          <AdminLayout />
        </PrivateRouteAdmin>
      ),
      children: [
        { index: true, element: <AdminDashboard /> },
        //Router Thống kê
        { path: "statistics", element: <AdminDashboard /> },
        { path: "SetNotification", element: <NotificationAdmin /> },

        //Router Danh mục
        { path: "category/list", element: <GetListCategory /> },
        { path: "category/add", element: <PostAddCategory /> },
        { path: "category/:id/edit", element: <PutEditCategory /> },

        //Router Sản phẩm
        { path: "phone/list", element: <GetList /> },
        { path: "phone/add", element: <PostAdd /> },
        { path: "phone/:id", element: <ProductDetail /> },
        { path: "phone/:id/edit", element: <PutEdit /> },
        { path: "phone/deleted-products", element: <Deleted_products /> },

        //Router Đăng ký, Đăng nhập
        { path: "comment/list", element: <CommentAdmin /> },
        { path: "comment/add", element: <CommentAdd /> },
        // {path:'login',element:<Login/>},

        /// Router quản lý tài khoản user
        { path: "user/listadmin", element: <GetAdmin /> },
        { path: "user/profileadmin", element: <ProfileAdmin /> },
        { path: "user/listclient", element: <GetClient /> },

        //Router Order
        //admin
        { path: "orders", element: <OrderList /> },
        { path: "orders/:id", element: <OrderDetail /> },
        { path: "orders/:id/return", element: <ReturnDetail /> },


        /// Router quản lý Khuyễn mãi
        { path: "promotion/list", element: <GetPromotion /> },
        { path: "promotion/add", element: <PostAddPromotion /> },
        { path: "promotion/edit/:id", element: <PutEditPromotion /> },
        { path: "promotion/detail/:id", element: <DetailPromotion /> },

        /// Router quản lý lien he
        { path: "contact/add", element: <ContactAdd /> },
        { path: "contact/list", element: <ContactList /> },

        /// Router quản lý banner
        { path: "banner/add", element: <BannerAdd /> },
        { path: "banner/list", element: <BannerList /> },
        { path: "banner/edit/:id", element: <BannerEdit /> },
        { path: "banner/detail/:id", element: <BannerDetail /> },

        // Router quản lý Color

        { path: 'color/add', element: <ColorAdd /> },
        { path: 'color/:id', element: <ColorEdit /> },

        // Router quản lý RAM

        { path: 'variant/list', element: <VariantList /> },
        { path: 'ram/add', element: <RamAdd /> },
        { path: 'ram/:id', element: <RamEdit /> },
        { path: "news", children: [
          { path: "list", element: <NewsList /> },
          { path: "add", element: <NewsAdd /> },
          { path: "edit/:id", element: <NewsEdit /> }
        ] },
      ],
    },
    { path: "/admin/*", element: <NotFound type="admin" /> },

  ]);
  return (
    <UserProvider>
      <CartProvider>
        {routes}
        <ToastContainer />
      </CartProvider>
    </UserProvider>
  );
};

export default App;
