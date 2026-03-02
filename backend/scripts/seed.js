require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { sequelize, User, Category, Product } = require('../config/db');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database synchronized');

    // Create categories
    console.log('📁 Creating categories...');
    const categories = await Category.bulkCreate([
      {
        name: 'Action Figures',
        description: 'Collectible action figures and character toys',
        image_url: '/images/categories/action-figures.jpg'
      },
      {
        name: 'Board Games',
        description: 'Fun board games for families and parties',
        image_url: '/images/categories/board-games.jpg'
      },
      {
        name: 'Dolls & Accessories',
        description: 'Beautiful dolls with complete accessories',
        image_url: '/images/categories/dolls.jpg'
      },
      {
        name: 'Puzzles',
        description: 'Educational puzzles for all ages',
        image_url: '/images/categories/puzzles.jpg'
      },
      {
        name: 'Building Sets',
        description: 'LEGO and building block sets',
        image_url: '/images/categories/building-sets.jpg'
      },
      {
        name: 'Outdoor Toys',
        description: 'Toys for outdoor play and sports',
        image_url: '/images/categories/outdoor.jpg'
      }
    ]);
    console.log(`✅ Created ${categories.length} categories`);

    // Create sample products
    console.log('🎲 Creating products...');
    const products = await Product.bulkCreate([
      // Action Figures
      {
        name: 'Super Hero Action Figure',
        description: 'Highly detailed collectible action figure with articulated joints',
        short_description: 'Premium collectible superhero figure',
        price: 29.99,
        categoryId: categories[0].id,
        image_url: '/images/products/superhero-figure.jpg',
        stock: 50,
        is_featured: true,
        availability: 'in_stock'
      },
      {
        name: 'Vintage Robot Figure',
        description: 'Classic retro-style robot with LED lights',
        short_description: 'Vintage robot collectible',
        price: 39.99,
        categoryId: categories[0].id,
        image_url: '/images/products/robot-figure.jpg',
        stock: 35,
        is_featured: true,
        availability: 'in_stock'
      },
      // Board Games
      {
        name: 'Strategy Board Game',
        description: 'Complex strategy game for adults and teens',
        short_description: 'Strategic board game for 2-4 players',
        price: 49.99,
        categoryId: categories[1].id,
        image_url: '/images/products/board-game-1.jpg',
        stock: 25,
        is_featured: true,
        availability: 'in_stock'
      },
      {
        name: 'Family Card Game',
        description: 'Fun game for the whole family',
        short_description: 'Fun card game for families',
        price: 19.99,
        categoryId: categories[1].id,
        image_url: '/images/products/card-game.jpg',
        stock: 60,
        is_featured: false,
        availability: 'in_stock'
      },
      // Puzzles
      {
        name: '1000 Piece Scenic Puzzle',
        description: 'Beautiful landscape puzzle with 1000 pieces',
        short_description: '1000-piece scenic jigsaw puzzle',
        price: 24.99,
        categoryId: categories[3].id,
        image_url: '/images/products/puzzle-1.jpg',
        stock: 40,
        is_featured: true,
        availability: 'in_stock'
      },
      {
        name: '3D Crystal Puzzle',
        description: 'Modern 3D crystal building puzzle',
        short_description: '3D crystal architecture puzzle',
        price: 34.99,
        categoryId: categories[3].id,
        image_url: '/images/products/puzzle-3d.jpg',
        stock: 30,
        is_featured: false,
        availability: 'in_stock'
      },
      // Building Sets
      {
        name: 'Building Block Set 500pcs',
        description: 'Large set of colorful building blocks',
        short_description: 'Colorful building blocks for kids',
        price: 44.99,
        categoryId: categories[4].id,
        image_url: '/images/products/blocks.jpg',
        stock: 45,
        is_featured: true,
        availability: 'in_stock'
      },
      // Dolls
      {
        name: 'Fashion Doll with Accessories',
        description: 'Fashionable doll with complete wardrobe and accessories',
        short_description: 'Fashion doll with full accessory set',
        price: 54.99,
        categoryId: categories[2].id,
        image_url: '/images/products/doll.jpg',
        stock: 20,
        is_featured: true,
        availability: 'in_stock'
      },
      // Outdoor
      {
        name: 'Kids Skateboard',
        description: 'Beginner-friendly skateboard with safety features',
        short_description: 'Kids skateboard with safety features',
        price: 59.99,
        categoryId: categories[5].id,
        image_url: '/images/products/skateboard.jpg',
        stock: 15,
        is_featured: false,
        availability: 'in_stock'
      },
      {
        name: 'Outdoor Sports Set',
        description: 'Complete set for outdoor sports activities',
        short_description: 'Multi-sport outdoor set',
        price: 74.99,
        categoryId: categories[5].id,
        image_url: '/images/products/sports-set.jpg',
        stock: 22,
        is_featured: true,
        availability: 'in_stock'
      }
    ]);
    console.log(`✅ Created ${products.length} products`);

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@toycart.com',
      password: adminPassword,
      role: 'admin'
    });
    console.log('✅ Admin user created (admin@toycart.com / admin123)');

    // Create test customer
    console.log('👤 Creating test customer...');
    const customerPassword = await bcrypt.hash('customer123', 10);
    const customer = await User.create({
      name: 'John Doe',
      email: 'customer@toycart.com',
      password: customerPassword,
      role: 'customer',
      phone: '1234567890',
      city: 'New York',
      state: 'NY',
      zipcode: '10001',
      address: '123 Main Street'
    });
    console.log('✅ Customer user created (customer@toycart.com / customer123)');

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📊 Seeded data:');
    console.log(`  - Categories: ${categories.length}`);
    console.log(`  - Products: ${products.length}`);
    console.log(`  - Users: 2 (1 admin, 1 customer)`);
    console.log('\n🔐 Test credentials:');
    console.log('  Admin: admin@toycart.com / admin123');
    console.log('  Customer: customer@toycart.com / customer123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n✅ Database connection closed');
  }
};

seedDatabase();
