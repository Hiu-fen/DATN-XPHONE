import { Link } from "react-router-dom";
import HamburgerMenu from "./componentChild/Header/HamburgerMenu";
import MenuNgangHeader from "./componentChild/Header/MenuNgang";
import SearchClient from "./componentChild/Header/SearchClient";
import UserMenu from "./componentChild/Header/UserMenu";
import TenThuongHieu from "./componentChild/Home/BrandTitle";

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

          {/* Search */}
          <div className="flex-1 flex justify-center">
            <SearchClient />
          </div>

          {/* Hamburger + User Menu */}
          <div className="flex-1 flex justify-end items-center">
            <UserMenu />
            <HamburgerMenu />
          </div>
        </div>
      </div>

      {/* Phần dưới: menu ngang */}
      <MenuNgangHeader />
    </header>
  );
};

export default ClientHeader;
