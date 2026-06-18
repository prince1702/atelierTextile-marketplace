const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Models
const User = require('./models/User');
const Design = require('./models/Design');
const Order = require('./models/Order');
const Cart = require('./models/Cart');
const Wishlist = require('./models/Wishlist');
const Ticket = require('./models/Ticket');

// Design images from mock data
const DESIGN_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBP7nX7MFqvCedZvBslh3pj7BYHMLhjMksF6nEumZZvu9NpSQdoBB5syoXkkqYE_ujYd02Y7m_qDMKXPufLQqo6ZmpL0KXf7Oa_uh0ZtRkC9YCeX-m8cTriV4cxX_xxshYh65smrAEHxYN_DrcpOVZ1BmssJggBZQKHglsruXzGbD2suEWV_7cYhh2EQ5c_AON6wNhT3juTO5IzQWkzcJ32HNP82wN75w-J6Ljq3lKTRHUeTf_8e4O5b_W6Drh52hnkahQNY4WEQ2k',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBdXycZ42hTyde99kqMbVABytjWE92Lzc65bghRI71IkBDUak8PZw7JSbKOrIS-zWlypEqicu3Eis5dKsbiXTTqbxoYJ-0fkQL_0vqzzYwFcQZbJPZcyJ2TQKD9u6YesOOnlGZT2C877dMm_Ejktak6sYyxos2r_G0dQQRr-iF3PO1a1DiHFhTJwSDrGlcbv6deZatNoAtsfJXu_6VHgeL01eKDgs3PN6cVHl3MQyUuYLZoBAZ3ws7m2nlfaSUGlooodM50G9AW1z0',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCPAJd-giJA_XCJwb9j9GsMFG4HLyOFzkmxJDN6Ge6C0B5bP3h4KH3505QQBHkdDkl27Bc5L3_ozcsacKVbsYn7Cwgt0-zlLAFjTyjawFbbqtvOXyEXf71Ls9hH-sCXBQX03EqmbqhlqFUvH_UCiwjJ-JmwS31ad4zvcf-Q0bXMjGnjvPi7tmJIpN3Srl4X_-y6kCkPw7wdvGBCu15PLdtBkigqBk38-rd5cru_EWYsGd1zKVNZanxL5gqVGWWDjS-cOaFnyLJZYog',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBoic2Xl_q5yRw_w2TEo7JfsBhSb2fMehgYXLk_yY2e-5k35yb30oBwocUzvCUxXeTbgq-u5WJv01Xe4xkmtMhRD08SXMAxnIPtHs30ieIIHJfPSxkidIS-B9INpIQdDl6YIab7nnPUO2qBJljvMOjrkoxXBQtR8fB0Vww5WwGefzb5c9DmTVwmq7BCszsYQC-F47KWroGPet-jpD6MEfSnsp9PedbPrOrp6k-y6saEKIBU7x3uqbyHOCn_EEBiDpMdVLdd2Hl9eZM',
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all collections
    await User.deleteMany();
    await Design.deleteMany();
    await Order.deleteMany();
    await Cart.deleteMany();
    await Wishlist.deleteMany();
    await Ticket.deleteMany();
    console.log('🗑️  All collections cleared');

    // --- SEED USERS ---
    const usersData = [
      { name: 'Alex Chen', email: 'admin@atelier.com', password: 'admin123', role: 'admin', status: 'active', country: 'USA' },
      { name: 'Elena Jenkins', email: 'seller@atelier.com', password: 'seller123', role: 'seller', status: 'active', country: 'France', totalRevenue: 42800, totalOrders: 284 },
      { name: 'Marcus Reed', email: 'customer@atelier.com', password: 'customer123', role: 'customer', status: 'active', country: 'USA', totalOrders: 12 },
      { name: 'Sarah Wong', email: 'sarah.w@threadco.com', password: 'password123', role: 'seller', status: 'pending', country: 'Singapore' },
      { name: 'David Torres', email: 'david.t@design.io', password: 'password123', role: 'seller', status: 'active', country: 'Spain', totalRevenue: 28600, totalOrders: 156 },
      { name: 'Priya Patel', email: 'priya.p@fashion.in', password: 'password123', role: 'customer', status: 'active', country: 'India', totalOrders: 8 },
      { name: 'James Kim', email: 'james.k@luxbrand.kr', password: 'password123', role: 'customer', status: 'active', country: 'South Korea', totalOrders: 24 },
      { name: 'Sophie Martin', email: 'sophie.m@atelier.fr', password: 'password123', role: 'seller', status: 'active', country: 'France', totalRevenue: 61200, totalOrders: 412 },
    ];

    const users = await User.create(usersData);
    console.log(`👤 ${users.length} users seeded`);

    // Map users by email for easy reference
    const admin = users.find((u) => u.email === 'admin@atelier.com');
    const seller1 = users.find((u) => u.email === 'seller@atelier.com');
    const seller2 = users.find((u) => u.email === 'david.t@design.io');
    const seller3 = users.find((u) => u.email === 'sophie.m@atelier.fr');
    const customer1 = users.find((u) => u.email === 'customer@atelier.com');
    const customer2 = users.find((u) => u.email === 'priya.p@fashion.in');
    const customer3 = users.find((u) => u.email === 'james.k@luxbrand.kr');

    // --- SEED DESIGNS ---
    const designsData = [
      {
        title: 'Geometric Navy Gold', designer: seller1._id, designerName: 'Studio Nord', designerAvatar: seller1.initials,
        price: 840, category: 'Geometric', fabric: 'Cotton Blend', image: DESIGN_IMAGES[0],
        rating: 4.9, reviews: 128, tags: ['geometric', 'navy', 'gold', 'corporate'],
        badge: 'New Arrival', badgeColor: 'amber',
        description: 'A sophisticated geometric pattern featuring precise angular forms in deep navy and warm gold. Perfect for corporate upholstery and premium fashion applications.',
        dimensions: '150cm width, repeat 30cm', colorways: ['Navy/Gold', 'Charcoal/Silver', 'Forest/Copper'],
        licenseType: 'Exclusive Global', status: 'active', sales: 47, revenue: 39480,
        createdAt: new Date('2024-10-24'),
      },
      {
        title: 'Indigo Amber Flow', designer: seller3._id, designerName: 'Atelier Rousseau', designerAvatar: seller3.initials,
        price: 1250, category: 'Watercolor', fabric: 'Silk', image: DESIGN_IMAGES[1],
        rating: 4.8, reviews: 94, tags: ['indigo', 'amber', 'watercolor', 'luxury'],
        badge: 'Limited Run', badgeColor: 'blue',
        description: 'An elegant watercolor-style textile design with flowing lines of rich indigo and warm amber.',
        dimensions: '140cm width, repeat 45cm', colorways: ['Indigo/Amber', 'Navy/Bronze', 'Teal/Gold'],
        licenseType: 'Standard Regional', status: 'active', sales: 31, revenue: 38750,
        createdAt: new Date('2024-10-20'),
      },
      {
        title: 'Precision Weave Technical', designer: seller2._id, designerName: 'ThreadMasters Co', designerAvatar: seller2.initials,
        price: 620, category: 'Technical', fabric: 'Polyester Blend', image: DESIGN_IMAGES[2],
        rating: 4.7, reviews: 203, tags: ['technical', 'precision', 'weave', 'industrial'],
        badge: 'In Stock', badgeColor: 'green',
        description: 'An ultra-precise technical weave pattern designed for industrial and performance textile applications.',
        dimensions: '160cm width, repeat 20cm', colorways: ['Cream/Navy', 'White/Grey', 'Ecru/Taupe'],
        licenseType: 'Open Regional', status: 'active', sales: 89, revenue: 55180,
        createdAt: new Date('2024-10-15'),
      },
      {
        title: 'Global Harvest Tapestry', designer: seller1._id, designerName: 'Weave & Wonder', designerAvatar: seller1.initials,
        price: 960, category: 'Tapestry', fabric: 'Wool Blend', image: DESIGN_IMAGES[3],
        rating: 4.6, reviews: 67, tags: ['tapestry', 'organic', 'harvest', 'artisan'],
        badge: 'Bestseller', badgeColor: 'orange',
        description: 'A rich tapestry-inspired pattern drawing from global artisan traditions.',
        dimensions: '145cm width, repeat 60cm', colorways: ['Earth/Rust', 'Ochre/Brown', 'Sage/Terracotta'],
        licenseType: 'Exclusive Global', status: 'active', sales: 62, revenue: 59520,
        createdAt: new Date('2024-10-10'),
      },
      {
        title: 'Silk Road Geometric', designer: seller2._id, designerName: 'Heritage Patterns', designerAvatar: seller2.initials,
        price: 1100, category: 'Geometric', fabric: 'Silk', image: DESIGN_IMAGES[0],
        rating: 4.9, reviews: 45, tags: ['silk', 'road', 'heritage', 'eastern'],
        badge: 'New Arrival', badgeColor: 'amber',
        description: 'Inspired by ancient Silk Road trade routes, this geometric pattern blends Eastern motifs with contemporary precision.',
        dimensions: '135cm width, repeat 40cm', colorways: ['Gold/Ivory', 'Burgundy/Gold', 'Midnight/Silver'],
        licenseType: 'Exclusive Global', status: 'active', sales: 18, revenue: 19800,
        createdAt: new Date('2024-11-01'),
      },
      {
        title: 'Ocean Wave Linen', designer: seller3._id, designerName: 'Coastal Studio', designerAvatar: seller3.initials,
        price: 490, category: 'Organic', fabric: 'Linen', image: DESIGN_IMAGES[1],
        rating: 4.5, reviews: 156, tags: ['ocean', 'wave', 'linen', 'coastal'],
        badge: 'In Stock', badgeColor: 'green',
        description: 'A flowing wave pattern in natural linen tones. Captures the organic movement of ocean waves.',
        dimensions: '155cm width, repeat 35cm', colorways: ['Sea Blue/Cream', 'Sand/Sky', 'Sage/White'],
        licenseType: 'Standard Regional', status: 'active', sales: 134, revenue: 65660,
        createdAt: new Date('2024-09-28'),
      },
      {
        title: 'Urban Grid Matrix', designer: seller1._id, designerName: 'Studio Nord', designerAvatar: seller1.initials,
        price: 720, category: 'Geometric', fabric: 'Cotton Blend', image: DESIGN_IMAGES[2],
        rating: 4.7, reviews: 89, tags: ['urban', 'grid', 'matrix', 'modern'],
        badge: 'Bestseller', badgeColor: 'orange',
        description: 'A bold urban grid pattern inspired by city architecture.',
        dimensions: '150cm width, repeat 25cm', colorways: ['Charcoal/White', 'Navy/Grey', 'Black/Gold'],
        licenseType: 'Open Regional', status: 'active', sales: 76, revenue: 54720,
        createdAt: new Date('2024-09-15'),
      },
      {
        title: 'Botanical Bloom Print', designer: seller2._id, designerName: 'Nature Designs Co', designerAvatar: seller2.initials,
        price: 580, category: 'Floral', fabric: 'Cotton Sateen', image: DESIGN_IMAGES[3],
        rating: 4.6, reviews: 112, tags: ['botanical', 'floral', 'bloom', 'nature'],
        badge: 'Limited Run', badgeColor: 'blue',
        description: 'A luxurious botanical print featuring intricate hand-drawn flowers and foliage.',
        dimensions: '145cm width, repeat 50cm', colorways: ['Blush/Green', 'Ivory/Blue', 'Mauve/Sage'],
        licenseType: 'Standard Regional', status: 'active', sales: 58, revenue: 33640,
        createdAt: new Date('2024-10-05'),
      },
    ];

    const designs = await Design.insertMany(designsData);
    console.log(`🎨 ${designs.length} designs seeded`);

    // --- SEED ORDERS ---
    const ordersData = [
      {
        design: designs[0]._id, designTitle: 'Geometric Navy Gold', designImage: DESIGN_IMAGES[0],
        seller: seller1._id, sellerName: 'Studio Nord',
        buyer: customer1._id, buyerName: 'Marcus Reed',
        amount: 840, status: 'completed', licenseType: 'Exclusive Global',
        createdAt: new Date('2024-10-24'),
      },
      {
        design: designs[1]._id, designTitle: 'Indigo Amber Flow', designImage: DESIGN_IMAGES[1],
        seller: seller3._id, sellerName: 'Atelier Rousseau',
        buyer: customer3._id, buyerName: 'James Kim',
        amount: 1250, status: 'processing', licenseType: 'Standard Regional',
        createdAt: new Date('2024-10-23'),
      },
      {
        design: designs[5]._id, designTitle: 'Ocean Wave Linen', designImage: DESIGN_IMAGES[2],
        seller: seller3._id, sellerName: 'Coastal Studio',
        buyer: customer2._id, buyerName: 'Priya Patel',
        amount: 490, status: 'completed', licenseType: 'Open Regional',
        createdAt: new Date('2024-10-22'),
      },
      {
        design: designs[7]._id, designTitle: 'Botanical Bloom Print', designImage: DESIGN_IMAGES[3],
        seller: seller2._id, sellerName: 'Nature Designs Co',
        buyer: customer1._id, buyerName: 'Marcus Reed',
        amount: 580, status: 'pending', licenseType: 'Standard Regional',
        createdAt: new Date('2024-10-21'),
      },
      {
        design: designs[4]._id, designTitle: 'Silk Road Geometric', designImage: DESIGN_IMAGES[0],
        seller: seller2._id, sellerName: 'Heritage Patterns',
        buyer: customer3._id, buyerName: 'James Kim',
        amount: 1100, status: 'completed', licenseType: 'Exclusive Global',
        createdAt: new Date('2024-10-20'),
      },
      {
        design: designs[6]._id, designTitle: 'Urban Grid Matrix', designImage: DESIGN_IMAGES[1],
        seller: seller1._id, sellerName: 'Studio Nord',
        buyer: customer2._id, buyerName: 'Priya Patel',
        amount: 720, status: 'refunded', licenseType: 'Open Regional',
        createdAt: new Date('2024-10-19'),
      },
    ];

    const orders = await Order.insertMany(ordersData);
    console.log(`📦 ${orders.length} orders seeded`);

    // --- SEED TICKETS ---
    const ticketsData = [
      {
        subject: 'Cannot download licensed design files',
        description: 'After purchasing the Geometric Navy Gold design, I am unable to access the download link. The page keeps showing an error.',
        user: customer1._id, status: 'in-progress', priority: 'high', category: 'Technical Issue',
        responses: 2, createdAt: new Date('2024-10-24'), updatedAt: new Date('2024-10-24'),
      },
      {
        subject: 'Request for exclusive licensing upgrade',
        description: 'I purchased a Standard Regional license but would like to upgrade to Exclusive Global. Please advise on the process and additional cost.',
        user: customer3._id, status: 'open', priority: 'medium', category: 'Licensing',
        responses: 0, createdAt: new Date('2024-10-23'), updatedAt: new Date('2024-10-23'),
      },
      {
        subject: 'Invoice discrepancy for order #8488',
        description: 'The invoice for order #8488 shows incorrect tax calculation. The amount charged does not match what was shown at checkout.',
        user: customer3._id, status: 'resolved', priority: 'low', category: 'Billing',
        responses: 4, createdAt: new Date('2024-10-20'), updatedAt: new Date('2024-10-22'),
      },
    ];

    const tickets = await Ticket.insertMany(ticketsData);
    console.log(`🎫 ${tickets.length} tickets seeded`);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Demo accounts:');
    console.log('  Admin:    admin@atelier.com    / admin123');
    console.log('  Seller:   seller@atelier.com   / seller123');
    console.log('  Customer: customer@atelier.com / customer123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await User.deleteMany();
    await Design.deleteMany();
    await Order.deleteMany();
    await Cart.deleteMany();
    await Wishlist.deleteMany();
    await Ticket.deleteMany();

    console.log('🗑️  All data destroyed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Destroy Error:', error);
    process.exit(1);
  }
};

// CLI usage: node seeder.js --import  |  node seeder.js --destroy
if (process.argv[2] === '--destroy') {
  destroyData();
} else {
  seedData();
}
