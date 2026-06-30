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
    const designsData = [];
    const designs = await Design.insertMany(designsData);
    console.log(`🎨 ${designs.length} designs seeded`);

    // --- SEED ORDERS ---
    const ordersData = [];
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

