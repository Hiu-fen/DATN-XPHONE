import { Link } from "react-router-dom";
import HamburgerMenu from "./componentChild/Header/HamburgerMenu";
import MenuNgangHeader from "./componentChild/Header/MenuNgang";
import SearchClient from "./componentChild/Header/SearchClient";
import UserMenu from "./componentChild/Header/UserMenu";
import TenThuongHieu from "./componentChild/Home/BrandTitle";
import PromoNotice from "./componentChild/Header/ThongBaoKhuyenMai";

const ClientHeader = () => {
  return (
    <header className="bg-white shadow">
      {/* Phần trên: logo, search, usermenu + hamburger */}
      <div className="w-full bg-white sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4 gap-3">
          {/* Logo */}
          <div className="flex-1 flex justify-start">
            <Link to="/" className="text-2xl sm:text-3xl font-bold text-red-600 whitespace-nowrap">
              <TenThuongHieu />
            </Link>
          </div>

          <div className="flex-1 flex justify-center items-center">
            <PromoNotice />
          </div>

          {/* Hamburger + User Menu + Search */}
          <div className="flex-1 flex justify-end items-center gap-1">
            <div className="flex items-center justify-center">
              <UserMenu />
            </div>
            <div className="flex items-center justify-center">
              <SearchClient />
            </div>
            <div className="flex items-center justify-center">
              <HamburgerMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Phần dưới: menu ngang */}
      <MenuNgangHeader />
    </header>
  );
};

export default ClientHeader;
