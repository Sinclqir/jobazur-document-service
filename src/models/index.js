const { DataTypes } = require('sequelize');
const sequelize = require('../db/sequelize');

const Document = require('./documentModel')(sequelize, DataTypes);

// Initialize models
const models = {
  Document
};

// Sync database (create tables if they don't exist)
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

// Call sync in development
if (process.env.NODE_ENV !== 'production') {
  syncDatabase();
}

module.exports = {
  sequelize,
  ...models
}; 