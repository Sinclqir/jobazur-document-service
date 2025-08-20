const { Sequelize } = require('sequelize');
require('dotenv').config();

const isSslEnabled = String(process.env.DB_SSL).toLowerCase() === 'true';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
    dialectOptions: isSslEnabled
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      : undefined,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

module.exports = sequelize; 