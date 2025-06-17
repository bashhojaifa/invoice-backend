const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/database');

class Invoice extends Model {}

// Define the Invoice model schema
Invoice.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'USD',
    },
    due_on: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
    account_number: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'users',
        key: 'account_number',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    sequelize,
    modelName: 'Invoice',
    tableName: 'invoices',
    timestamps: true,
  },
);

module.exports = Invoice;
