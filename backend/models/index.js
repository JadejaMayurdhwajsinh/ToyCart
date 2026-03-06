const { Sequelize } = require('sequelize');

// Initialize Sequelize with MySQL
// Make sure to set these environment variables in your .env file:
// DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
const sequelize = new Sequelize(
  process.env.DB_NAME || 'toycart',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Set to console.log for query logging
  }
);

// Import models
const User = require('./User')(sequelize);
const Category = require('./Category')(sequelize);
const Product = require('./Product')(sequelize);
const Cart = require('./Cart')(sequelize);
const Order = require('./Order')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);
const Review = require('./Review')(sequelize);
const WishList = require('./WishList')(sequelize);


// User associations
User.hasMany(Cart, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
User.hasMany(Order, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
User.hasMany(Review, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
User.hasMany(WishList, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// Category associations
Category.hasMany(Product, {
  foreignKey: 'categoryId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// Product associations
Product.belongsTo(Category, {
  foreignKey: 'categoryId',
});
Product.hasMany(Cart, {
  foreignKey: 'productId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Product.hasMany(OrderItem, {
  foreignKey: 'productId',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
Product.hasMany(Review, {
  foreignKey: 'productId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Product.hasMany(WishList, {
  foreignKey: 'productId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// Cart associations
Cart.belongsTo(User, {
  foreignKey: 'userId',
});
Cart.belongsTo(Product, {
  foreignKey: 'productId',
});

// Order associations
Order.belongsTo(User, {
  foreignKey: 'userId',
});
Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

// OrderItem associations
OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
});
OrderItem.belongsTo(Product, {
  foreignKey: 'productId',
});

// Review associations
Review.belongsTo(User, {
  foreignKey: 'userId',
});
Review.belongsTo(Product, {
  foreignKey: 'productId',
});

// WishList associations
WishList.belongsTo(User, {
  foreignKey: 'userId',
});
WishList.belongsTo(Product, {
  foreignKey: 'productId',
});

// Export models and sequelize instance
module.exports = {
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
