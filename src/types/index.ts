export interface MenuItemTag {
  text_he: string;
  text_en: string;
  color: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'orange';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface MenuItem {
  id: string;
  name_he: string;
  name_en: string;
  description_he: string;
  description_en: string;
  price: number;
  category: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  spice_level?: number;
  image_url?: string;
  portion_size?: string;
  allergens?: string;
  available: boolean;
  sort_order: number;
  tags?: MenuItemTag[];
  addOns?: AddOn[];
}

export interface AddOn {
  id: string;
  menu_item_id?: string | null;
  name_he: string;
  name_en: string;
  price: number;
  available: boolean;
  sort_order?: number;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  review_he?: string;
  review_en?: string;
  date: string;
  approved: boolean;
}

export interface ContactMessage {
  name: string;
  phone: string;
  email?: string;
  preferred_date?: string;
  preferred_time?: string;
  message: string;
}

export type Language = 'he' | 'en';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  selectedAddOns: AddOn[];
}

export interface OrderDetails {
  fullName: string;
  email: string;
  phone: string;
  deliveryDate: string;
  deliveryTime: string;
  address: string;
  city: string;
  street: string;
  houseNumber: string;
  apartment?: string;
  floor?: string;
  notes?: string;
<<<<<<< HEAD
  paymentMethod: 'cash' | 'bit' | 'paybox';
=======
  paymentMethod: 'cash' | 'grow';
>>>>>>> f0a58e6 (Initial commit)
}

export interface DeliveryArea {
  city: string;
  streets: string[];
}
