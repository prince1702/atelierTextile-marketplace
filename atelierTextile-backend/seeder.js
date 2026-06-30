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

const seedDataWithoutExit = async () => {
  try {
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
        title: 'Royal Jacquard Weave', designer: seller1._id, designerName: 'Studio Nord', designerAvatar: seller1.initials,
        price: 950, category: 'Weaving Design', subcategory: 'Kotalichi Design', fabric: 'Wool Blend', image: DESIGN_IMAGES[0],
        rating: 4.9, reviews: 128, tags: ['weaving', 'jacquard', 'textured', 'traditional'],
        badge: 'New Arrival', badgeColor: 'amber',
        description: 'A sophisticated jacquard woven textile design featuring rich textures and intricate traditional weaving patterns. Excellent for premium heavy fabrics.',
        dimensions: '150cm width, repeat 30cm', colorways: ['Gold/Navy', 'Silver/Charcoal', 'Copper/Forest'],
        licenseType: 'Exclusive Global', status: 'active', sales: 47, revenue: 44650,
        createdAt: new Date('2024-10-24'),
      },
      {
        title: 'Indigo Sashiko Embroidery', designer: seller3._id, designerName: 'Atelier Rousseau', designerAvatar: seller3.initials,
        price: 1250, category: 'Embroidery Design', subcategory: 'Multi Design', fabric: 'Linen', image: DESIGN_IMAGES[1],
        rating: 4.8, reviews: 94, tags: ['embroidery', 'sashiko', 'hand-stitched', 'indigo'],
        badge: 'Limited Run', badgeColor: 'blue',
        description: 'An elegant hand-stitched embroidery design inspired by traditional Japanese Sashiko patterns. Ideal for high-end home textiles and apparel.',
        dimensions: '140cm width, repeat 45cm', colorways: ['Indigo/White', 'Navy/Cream', 'Slate/Grey'],
        licenseType: 'Standard Regional', status: 'active', sales: 31, revenue: 38750,
        createdAt: new Date('2024-10-20'),
      },
      {
        title: 'Modernist Abstract Digital Print', designer: seller2._id, designerName: 'ThreadMasters Co', designerAvatar: seller2.initials,
        price: 850, category: 'Digital Print Design', fabric: 'Silk', image: DESIGN_IMAGES[2],
        rating: 4.7, reviews: 203, tags: ['digital print', 'abstract', 'colorful', 'modernist'],
        badge: 'In Stock', badgeColor: 'green',
        description: 'A vibrant abstract digital print design with fluid gradients and high-definition details, perfectly engineered for digital printers on luxury silk.',
        dimensions: '160cm width, repeat 20cm', colorways: ['Cyan/Magenta', 'Yellow/Violet', 'Orange/Blue'],
        licenseType: 'Open Regional', status: 'active', sales: 89, revenue: 75650,
        createdAt: new Date('2024-10-15'),
      },
      {
        title: 'Symmetrical Positioned Chest Print', designer: seller1._id, designerName: 'Weave & Wonder', designerAvatar: seller1.initials,
        price: 650, category: 'Position Print Design', fabric: 'Cotton Sateen', image: DESIGN_IMAGES[3],
        rating: 4.6, reviews: 67, tags: ['position print', 'symmetrical', 'placement', 'motif'],
        badge: 'Bestseller', badgeColor: 'orange',
        description: 'A placement/position print design featuring a symmetrical artisan motif, precisely sized for placement on garments and center panels.',
        dimensions: '145cm width, repeat 60cm', colorways: ['Cream/Black', 'Gold/Charcoal', 'Rust/Ivory'],
        licenseType: 'Exclusive Global', status: 'active', sales: 62, revenue: 40300,
        createdAt: new Date('2024-10-10'),
      },
      {
        title: 'Herringbone Technical Weaving', designer: seller2._id, designerName: 'Heritage Patterns', designerAvatar: seller2.initials,
        price: 720, category: 'Weaving Design', subcategory: '50 600 Design', fabric: 'Cotton Blend', image: DESIGN_IMAGES[0],
        rating: 4.9, reviews: 45, tags: ['weaving', 'herringbone', 'technical', 'structural'],
        badge: 'New Arrival', badgeColor: 'amber',
        description: 'A modern structural herringbone weaving pattern with detailed warp and weft layouts, designed for techwear and outdoor accessories.',
        dimensions: '135cm width, repeat 40cm', colorways: ['Olive/Black', 'Grey/White', 'Navy/Brown'],
        licenseType: 'Exclusive Global', status: 'active', sales: 18, revenue: 12960,
        createdAt: new Date('2024-11-01'),
      },
      {
        title: 'Gold Thread Royal Embroidery', designer: seller3._id, designerName: 'Coastal Studio', designerAvatar: seller3.initials,
        price: 1450, category: 'Embroidery Design', subcategory: 'Sequin Design', fabric: 'Silk', image: DESIGN_IMAGES[1],
        rating: 4.5, reviews: 156, tags: ['embroidery', 'gold thread', 'royal', 'luxury'],
        badge: 'In Stock', badgeColor: 'green',
        description: 'Luxurious heavy embroidery motif with detailed gold stitching simulations, perfect for festive couture and velvet cushions.',
        dimensions: '155cm width, repeat 35cm', colorways: ['Gold/Crimson', 'Gold/Emerald', 'Gold/Royal Blue'],
        licenseType: 'Standard Regional', status: 'active', sales: 134, revenue: 194300,
        createdAt: new Date('2024-09-28'),
      },
      {
        title: 'Vibrant Floral Digital Print', designer: seller1._id, designerName: 'Studio Nord', designerAvatar: seller1.initials,
        price: 890, category: 'Digital Print Design', fabric: 'Cotton Sateen', image: DESIGN_IMAGES[2],
        rating: 4.7, reviews: 89, tags: ['digital print', 'floral', 'watercolor', 'botanical'],
        badge: 'Bestseller', badgeColor: 'orange',
        description: 'Ultra-high-definition digital textile print of contemporary watercolor florals, ready for roll-to-roll printing.',
        dimensions: '150cm width, repeat 25cm', colorways: ['Pastel Pink/Sage', 'Bold Blue/Amber', 'Mauve/Teal'],
        licenseType: 'Open Regional', status: 'active', sales: 76, revenue: 67640,
        createdAt: new Date('2024-09-15'),
      },
      {
        title: 'Border Accent Position Motif', designer: seller2._id, designerName: 'Nature Designs Co', designerAvatar: seller2.initials,
        price: 720, category: 'Position Print Design', fabric: 'Linen', image: DESIGN_IMAGES[3],
        rating: 4.6, reviews: 112, tags: ['position print', 'border', 'motif', 'placement'],
        badge: 'Limited Run', badgeColor: 'blue',
        description: 'A border-aligned placement print designed specifically for skirt hems, sleeve cuffs, and tablecloth margins.',
        dimensions: '145cm width, repeat 50cm', colorways: ['White/Blue', 'Cream/Rust', 'Ecru/Sage'],
        licenseType: 'Standard Regional', status: 'active', sales: 58, revenue: 41760,
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

  } catch (error) {
    console.error('❌ Seeder Error:', error);
    throw error;
  }
};

const seedData = async () => {
  try {
    await seedDataWithoutExit();
    process.exit(0);
  } catch (error) {
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

module.exports = {
  seedDataWithoutExit,
  seedData,
  destroyData
};

// CLI usage: node seeder.js --import  |  node seeder.js --destroy
if (require.main === module) {
  if (process.argv[2] === '--destroy') {
    destroyData();
  } else {
    seedData();
  }
}

