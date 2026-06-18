// Mock data for the AtelierTextile Marketplace

export interface Design {
  id: string;
  title: string;
  designer: string;
  designerAvatar: string;
  price: number;
  category: string;
  fabric: string;
  image: string;
  rating: number;
  reviews: number;
  tags: string[];
  badge?: 'New Arrival' | 'Limited Run' | 'In Stock' | 'Bestseller';
  badgeColor?: string;
  isWishlisted?: boolean;
  description: string;
  dimensions: string;
  colorways: string[];
  licenseType: string;
  createdAt: string;
  status: 'active' | 'pending' | 'rejected';
  sales: number;
  revenue: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'customer';
  avatar: string;
  initials: string;
  status: 'active' | 'pending' | 'suspended';
  joinedAt: string;
  country: string;
  totalOrders?: number;
  totalRevenue?: number;
}

export interface Order {
  id: string;
  design: string;
  designer: string;
  customer: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing' | 'refunded';
  date: string;
  licenseType: string;
  image: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  updatedAt: string;
  responses: number;
}

export const DESIGN_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBP7nX7MFqvCedZvBslh3pj7BYHMLhjMksF6nEumZZvu9NpSQdoBB5syoXkkqYE_ujYd02Y7m_qDMKXPufLQqo6ZmpL0KXf7Oa_uh0ZtRkC9YCeX-m8cTriV4cxX_xxshYh65smrAEHxYN_DrcpOVZ1BmssJggBZQKHglsruXzGbD2suEWV_7cYhh2EQ5c_AON6wNhT3juTO5IzQWkzcJ32HNP82wN75w-J6Ljq3lKTRHUeTf_8e4O5b_W6Drh52hnkahQNY4WEQ2k',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBdXycZ42hTyde99kqMbVABytjWE92Lzc65bghRI71IkBDUak8PZw7JSbKOrIS-zWlypEqicu3Eis5dKsbiXTTqbxoYJ-0fkQL_0vqzzYwFcQZbJPZcyJ2TQKD9u6YesOOnlGZT2C877dMm_Ejktak6sYyxos2r_G0dQQRr-iF3PO1a1DiHFhTJwSDrGlcbv6deZatNoAtsfJXu_6VHgeL01eKDgs3PN6cVHl3MQyUuYLZoBAZ3ws7m2nlfaSUGlooodM50G9AW1z0',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCPAJd-giJA_XCJwb9j9GsMFG4HLyOFzkmxJDN6Ge6C0B5bP3h4KH3505QQBHkdDkl27Bc5L3_ozcsacKVbsYn7Cwgt0-zlLAFjTyjawFbbqtvOXyEXf71Ls9hH-sCXBQX03EqmbqhlqFUvH_UCiwjJ-JmwS31ad4zvcf-Q0bXMjGnjvPi7tmJIpN3Srl4X_-y6kCkPw7wdvGBCu15PLdtBkigqBk38-rd5cru_EWYsGd1zKVNZanxL5gqVGWWDjS-cOaFnyLJZYog',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBoic2Xl_q5yRw_w2TEo7JfsBhSb2fMehgYXLk_yY2e-5k35yb30oBwocUzvCUxXeTbgq-u5WJv01Xe4xkmtMhRD08SXMAxnIPtHs30ieIIHJfPSxkidIS-B9INpIQdDl6YIab7nnPUO2qBJljvMOjrkoxXBQtR8fB0Vww5WwGefzb5c9DmTVwmq7BCszsYQC-F47KWroGPet-jpD6MEfSnsp9PedbPrOrp6k-y6saEKIBU7x3uqbyHOCn_EEBiDpMdVLdd2Hl9eZM',
];

export const designs: Design[] = [
  { id: '1', title: 'Geometric Navy Gold', designer: 'Studio Nord', designerAvatar: 'SN', price: 840, category: 'Geometric', fabric: 'Cotton Blend', image: DESIGN_IMAGES[0], rating: 4.9, reviews: 128, tags: ['geometric', 'navy', 'gold', 'corporate'], badge: 'New Arrival', badgeColor: 'amber', description: 'A sophisticated geometric pattern featuring precise angular forms in deep navy and warm gold. Perfect for corporate upholstery and premium fashion applications.', dimensions: '150cm width, repeat 30cm', colorways: ['Navy/Gold', 'Charcoal/Silver', 'Forest/Copper'], licenseType: 'Exclusive Global', createdAt: '2024-10-24', status: 'active', sales: 47, revenue: 39480 },
  { id: '2', title: 'Indigo Amber Flow', designer: 'Atelier Rousseau', designerAvatar: 'AR', price: 1250, category: 'Watercolor', fabric: 'Silk', image: DESIGN_IMAGES[1], rating: 4.8, reviews: 94, tags: ['indigo', 'amber', 'watercolor', 'luxury'], badge: 'Limited Run', badgeColor: 'blue', description: 'An elegant watercolor-style textile design with flowing lines of rich indigo and warm amber. The fabric is softly draped, highlighting its premium quality.', dimensions: '140cm width, repeat 45cm', colorways: ['Indigo/Amber', 'Navy/Bronze', 'Teal/Gold'], licenseType: 'Standard Regional', createdAt: '2024-10-20', status: 'active', sales: 31, revenue: 38750 },
  { id: '3', title: 'Precision Weave Technical', designer: 'ThreadMasters Co', designerAvatar: 'TM', price: 620, category: 'Technical', fabric: 'Polyester Blend', image: DESIGN_IMAGES[2], rating: 4.7, reviews: 203, tags: ['technical', 'precision', 'weave', 'industrial'], badge: 'In Stock', badgeColor: 'green', description: 'An ultra-precise technical weave pattern designed for industrial and performance textile applications. High durability meets sophisticated aesthetics.', dimensions: '160cm width, repeat 20cm', colorways: ['Cream/Navy', 'White/Grey', 'Ecru/Taupe'], licenseType: 'Open Regional', createdAt: '2024-10-15', status: 'active', sales: 89, revenue: 55180 },
  { id: '4', title: 'Global Harvest Tapestry', designer: 'Weave & Wonder', designerAvatar: 'WW', price: 960, category: 'Tapestry', fabric: 'Wool Blend', image: DESIGN_IMAGES[3], rating: 4.6, reviews: 67, tags: ['tapestry', 'organic', 'harvest', 'artisan'], badge: 'Bestseller', badgeColor: 'orange', description: 'A rich tapestry-inspired pattern drawing from global artisan traditions. Features organic forms and earth-toned palettes for premium home décor.', dimensions: '145cm width, repeat 60cm', colorways: ['Earth/Rust', 'Ochre/Brown', 'Sage/Terracotta'], licenseType: 'Exclusive Global', createdAt: '2024-10-10', status: 'active', sales: 62, revenue: 59520 },
  { id: '5', title: 'Silk Road Geometric', designer: 'Heritage Patterns', designerAvatar: 'HP', price: 1100, category: 'Geometric', fabric: 'Silk', image: DESIGN_IMAGES[0], rating: 4.9, reviews: 45, tags: ['silk', 'road', 'heritage', 'eastern'], badge: 'New Arrival', badgeColor: 'amber', description: 'Inspired by ancient Silk Road trade routes, this geometric pattern blends Eastern motifs with contemporary precision for luxury fashion.', dimensions: '135cm width, repeat 40cm', colorways: ['Gold/Ivory', 'Burgundy/Gold', 'Midnight/Silver'], licenseType: 'Exclusive Global', createdAt: '2024-11-01', status: 'active', sales: 18, revenue: 19800 },
  { id: '6', title: 'Ocean Wave Linen', designer: 'Coastal Studio', designerAvatar: 'CS', price: 490, category: 'Organic', fabric: 'Linen', image: DESIGN_IMAGES[1], rating: 4.5, reviews: 156, tags: ['ocean', 'wave', 'linen', 'coastal'], badge: 'In Stock', badgeColor: 'green', description: 'A flowing wave pattern in natural linen tones. Captures the organic movement of ocean waves for sustainable fashion and home textiles.', dimensions: '155cm width, repeat 35cm', colorways: ['Sea Blue/Cream', 'Sand/Sky', 'Sage/White'], licenseType: 'Standard Regional', createdAt: '2024-09-28', status: 'active', sales: 134, revenue: 65660 },
  { id: '7', title: 'Urban Grid Matrix', designer: 'Studio Nord', designerAvatar: 'SN', price: 720, category: 'Geometric', fabric: 'Cotton Blend', image: DESIGN_IMAGES[2], rating: 4.7, reviews: 89, tags: ['urban', 'grid', 'matrix', 'modern'], badge: 'Bestseller', badgeColor: 'orange', description: 'A bold urban grid pattern inspired by city architecture. Clean lines and precise geometry create a sophisticated modern aesthetic.', dimensions: '150cm width, repeat 25cm', colorways: ['Charcoal/White', 'Navy/Grey', 'Black/Gold'], licenseType: 'Open Regional', createdAt: '2024-09-15', status: 'active', sales: 76, revenue: 54720 },
  { id: '8', title: 'Botanical Bloom Print', designer: 'Nature Designs Co', designerAvatar: 'ND', price: 580, category: 'Floral', fabric: 'Cotton Sateen', image: DESIGN_IMAGES[3], rating: 4.6, reviews: 112, tags: ['botanical', 'floral', 'bloom', 'nature'], badge: 'Limited Run', badgeColor: 'blue', description: 'A luxurious botanical print featuring intricate hand-drawn flowers and foliage. Perfect for premium home furnishing and fashion applications.', dimensions: '145cm width, repeat 50cm', colorways: ['Blush/Green', 'Ivory/Blue', 'Mauve/Sage'], licenseType: 'Standard Regional', createdAt: '2024-10-05', status: 'active', sales: 58, revenue: 33640 },
];

export const users: User[] = [
  { id: '1', name: 'Elena Jenkins', email: 'elena.j@atelier.com', role: 'seller', avatar: '', initials: 'EJ', status: 'active', joinedAt: '2023-10-24', country: 'France', totalRevenue: 42800, totalOrders: 284 },
  { id: '2', name: 'Marcus Reed', email: 'marcus.r@buyer.com', role: 'customer', avatar: '', initials: 'MR', status: 'active', joinedAt: '2023-10-23', country: 'USA', totalOrders: 12 },
  { id: '3', name: 'Sarah Wong', email: 'sarah.w@threadco.com', role: 'seller', avatar: '', initials: 'SW', status: 'pending', joinedAt: '2023-10-22', country: 'Singapore', totalRevenue: 0, totalOrders: 0 },
  { id: '4', name: 'David Torres', email: 'david.t@design.io', role: 'seller', avatar: '', initials: 'DT', status: 'active', joinedAt: '2023-10-21', country: 'Spain', totalRevenue: 28600, totalOrders: 156 },
  { id: '5', name: 'Priya Patel', email: 'priya.p@fashion.in', role: 'customer', avatar: '', initials: 'PP', status: 'active', joinedAt: '2023-10-20', country: 'India', totalOrders: 8 },
  { id: '6', name: 'James Kim', email: 'james.k@luxbrand.kr', role: 'customer', avatar: '', initials: 'JK', status: 'active', joinedAt: '2023-10-18', country: 'South Korea', totalOrders: 24 },
  { id: '7', name: 'Sophie Martin', email: 'sophie.m@atelier.fr', role: 'seller', avatar: '', initials: 'SM', status: 'active', joinedAt: '2023-09-15', country: 'France', totalRevenue: 61200, totalOrders: 412 },
  { id: '8', name: 'Alex Chen', email: 'alex.c@admin.com', role: 'admin', avatar: '', initials: 'AC', status: 'active', joinedAt: '2023-01-01', country: 'USA' },
];

export const orders: Order[] = [
  { id: '#8492', design: 'Geometric Navy Gold', designer: 'Studio Nord', customer: 'Marcus Reed', amount: 840, status: 'completed', date: '2024-10-24', licenseType: 'Exclusive Global', image: DESIGN_IMAGES[0] },
  { id: '#8491', design: 'Indigo Amber Flow', designer: 'Atelier Rousseau', customer: 'James Kim', amount: 1250, status: 'processing', date: '2024-10-23', licenseType: 'Standard Regional', image: DESIGN_IMAGES[1] },
  { id: '#8490', design: 'Ocean Wave Linen', designer: 'Coastal Studio', customer: 'Priya Patel', amount: 490, status: 'completed', date: '2024-10-22', licenseType: 'Open Regional', image: DESIGN_IMAGES[2] },
  { id: '#8489', design: 'Botanical Bloom Print', designer: 'Nature Designs Co', customer: 'Marcus Reed', amount: 580, status: 'pending', date: '2024-10-21', licenseType: 'Standard Regional', image: DESIGN_IMAGES[3] },
  { id: '#8488', design: 'Silk Road Geometric', designer: 'Heritage Patterns', customer: 'James Kim', amount: 1100, status: 'completed', date: '2024-10-20', licenseType: 'Exclusive Global', image: DESIGN_IMAGES[0] },
  { id: '#8487', design: 'Urban Grid Matrix', designer: 'Studio Nord', customer: 'Priya Patel', amount: 720, status: 'refunded', date: '2024-10-19', licenseType: 'Open Regional', image: DESIGN_IMAGES[1] },
];

export const tickets: Ticket[] = [
  { id: 'TKT-001', subject: 'Cannot download licensed design files', description: 'After purchasing the Geometric Navy Gold design, I am unable to access the download link. The page keeps showing an error.', status: 'in-progress', priority: 'high', category: 'Technical Issue', createdAt: '2024-10-24', updatedAt: '2024-10-24', responses: 2 },
  { id: 'TKT-002', subject: 'Request for exclusive licensing upgrade', description: 'I purchased a Standard Regional license but would like to upgrade to Exclusive Global. Please advise on the process and additional cost.', status: 'open', priority: 'medium', category: 'Licensing', createdAt: '2024-10-23', updatedAt: '2024-10-23', responses: 0 },
  { id: 'TKT-003', subject: 'Invoice discrepancy for order #8488', description: 'The invoice for order #8488 shows incorrect tax calculation. The amount charged does not match what was shown at checkout.', status: 'resolved', priority: 'low', category: 'Billing', createdAt: '2024-10-20', updatedAt: '2024-10-22', responses: 4 },
];

export const monthlyRevenue = [42000, 55000, 48000, 70000, 65000, 84000, 92000, 78000, 88000, 95000, 102000, 115000];
export const monthlyUsers = [800, 1200, 950, 1400, 1300, 1600, 1800, 1500, 1900, 2100, 2400, 2800];
export const monthlyOrders = [120, 180, 145, 210, 190, 240, 280, 220, 260, 290, 320, 380];
export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CATEGORIES = ['All', 'Geometric', 'Floral', 'Watercolor', 'Technical', 'Tapestry', 'Organic', 'Abstract'];
export const FABRICS = ['All', 'Cotton Blend', 'Silk', 'Linen', 'Polyester Blend', 'Wool Blend', 'Cotton Sateen'];
export const PRICE_RANGES = ['All', 'Under $500', '$500 - $800', '$800 - $1000', 'Over $1000'];
