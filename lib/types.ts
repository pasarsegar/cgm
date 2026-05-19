export interface MenuItem {
  id: string;
  label: string;
  type: 'page' | 'custom' | 'category';
  url?: string;
  children?: MenuItem[];
  isOpen?: boolean;
}

export interface Variation {
  id: string;
  name: string; // e.g. "S55", "N55", "B58"
  price: number;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  subCategories?: SubCategory[];
}

export interface Product {
  id: string;
  name: string;
  price: number; // Base price or min price for variable products
  image: string;
  gallery?: string[]; // Array of image URLs
  rating: number;
  category: string; // Category slug
  category_id?: string;
  sub_category_id?: string;
  subCategory?: string; // Sub-category slug
  type: "simple" | "variable";
  variations?: Variation[];
  description?: string;
  categories?: {
    name: string;
    slug: string;
  };
}

export interface Widget {
  id: string;
  type: 'search' | 'recent_posts' | 'categories' | 'custom_html' | 'text' | 'image' | 'contact_info' | 'social_links';
  title: string;
  settings: Record<string, any>;
}

export interface WidgetArea {
  id: string;
  name: string;
  description?: string;
  widgets: Widget[];
}
