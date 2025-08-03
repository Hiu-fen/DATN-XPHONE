export interface IColor {
  _id?: string;
  name: string;
  variantCategory?: string; // Lưu _id của VariantCategory
}

export interface IVariantCategory {
  _id?: string;
  name: string;
}

export interface IRam {
  _id?: string;
  size: string;
  variantCategory?: string; // Nếu RAM cũng dùng VariantCategory
}