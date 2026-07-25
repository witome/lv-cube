export interface CategoryAttribute {
  name: string;
  type: 'text' | 'number' | 'select' | 'checkbox';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface Category {
  id: number;
  parentId?: number;
  name: string;
  level: number;
  sort: number;
  icon?: string;
  attrTemplate: CategoryAttribute[];
  status: 'active' | 'inactive';
}

export interface ProductSku {
  id: number;
  productId: number;
  skuName: string;
  price: number;
  originalPrice?: number;
  stock: number;
  weight?: number;
  specValues: Record<string, string>;
}

export interface Product {
  id: number;
  supplierId: number;
  categoryId: number;
  name: string;
  subtitle?: string;
  mainImages: string[];
  description?: string;
  status: 'on' | 'off';
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
  skus: ProductSku[];
}

export interface ProductReview {
  id: number;
  orderItemId: number;
  userId: number;
  productId: number;
  rating: number;
  content?: string;
  images?: string[];
  createdAt: Date;
}
