export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'customer';
  initials: string;
  avatar?: string;
  status: 'active' | 'pending' | 'suspended';
  joinedAt: string;
  country: string;
  totalOrders?: number;
  totalRevenue?: number;
}

export interface Design {
  id: string;
  title: string;
  designer: string; // Designer user ID
  designerName: string;
  designerAvatar: string;
  price: number;
  category: 'Weaving Design' | 'Embroidery Design' | 'Digital Print Design' | 'Position Print Design';
  subcategory?: string;
  image: string;
  rating: number;
  reviews: number;
  tags: string[];
  badge?: 'New Arrival' | 'Limited Run' | 'In Stock' | 'Bestseller' | '';
  badgeColor?: string;
  description: string;
  dimensions: string;
  colorways: string[];
  licenseType: 'Exclusive Global' | 'Standard Regional' | 'Open Regional';
  createdAt: string;
  status: 'active' | 'pending' | 'rejected';
  sales: number;
  revenue: number;
  designType?: string;
  area?: string;
  needle?: string;
  height?: string;
  width?: string;
  color?: string;
  designFormat?: string;
  sareeConcept?: string;
  pdcPrice?: number;
  designFile?: string;
  additionalImages?: string[];
}

export interface Order {
  id: string;
  design?: Design;
  designTitle: string;
  designImage: string;
  seller: string;
  sellerName: string;
  buyer: string;
  buyerName: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing' | 'refunded' | 'rejected';
  date: string;
  licenseType: string;
  paymentScreenshot?: string;
  paymentNote?: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  user: string | { name: string; email: string; initials: string };
  createdAt: string;
  updatedAt: string;
  responses: number;
}
