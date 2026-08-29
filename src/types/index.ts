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
  walletBalance?: number; // 60% seller earnings
  grossSales?: number;
  adminShare?: number; // 40% platform share
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
  images?: string[];
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
  pdcDesignFile?: string;
  additionalImages?: string[];
  originalPrice?: number;
  discountPercentage?: number;
  offerName?: string;
  offerType?: string;
  offerPrice?: number;
  isBulk?: boolean;
  pdfUrl?: string;
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
  sellerEarnings?: number; // 60% share
  adminFee?: number; // 40% share
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

export interface Feedback {
  id: string;
  order: string;
  design: string;
  designTitle: string;
  designImage?: string;
  seller: string;
  sellerName: string;
  customer?: string | { name?: string; email?: string };
  customerName?: string;
  rating: 'Good' | 'Very Good' | 'Not Good' | 'Duplicate' | 'Refund';
  comment?: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  offerName: string;
  offerType: 'Festival Offer' | 'Seasonal Offer' | 'Special Offer' | 'Clearance Sale' | 'Other';
  discountPercentage: number;
  startDateTime: string;
  endDateTime: string;
  status: 'scheduled' | 'active' | 'expired' | 'disabled';
  priority: number;
  createdAt: string;
  updatedAt: string;
}


