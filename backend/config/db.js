const { sequelize, User, Category, Product, Cart, Order, OrderItem, Review, WishList } = require('../models');

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');

    // Sync models with database
    await sequelize.sync({ alter: false });
    console.log('✅ All models were synchronized successfully.');

    return sequelize;
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  sequelize,
  User,
  Category,
  Product,
  Cart,
  Order,
  OrderItem,
  Review,
  WishList,
};

sequelize.sync({ alter: true })