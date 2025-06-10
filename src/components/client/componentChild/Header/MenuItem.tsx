// menuItems.ts
const menuItems = [
  { label: "Trang chủ", path: "/" },
  { label: "Giới thiệu", path: "/about" },
  { label: "Sản phẩm", path: "/product", submenuType: "categories" },
  { label: "iPhone", path: "#", submenuType: "products", categoryId: "6841178c7543156eb6b12336" },
  { label: "SamSung", path: "#", submenuType: "products", categoryId: "684117a67543156eb6b1233a" },
  { label: "Vivo", path: "#", submenuType: "products", categoryId: "684117fe7543156eb6b12343" },
  { label: "Oppo", path: "#", submenuType: "products", categoryId: "684117e07543156eb6b12340" },
  { label: "Tin Tức", path: "/news" },
  { label: "Liên hệ", path: "/contact" },
];

export default menuItems
