const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

const { Roles } = require('../../constants/enums/roles');
const User = require('../user/user.entity');
const Invoice = require('./invoice.entity');
const sequelize = require('../../config/database');
const { parseCSV } = require('../../utils/parseCsv');
const { parseJSON } = require('../../utils/parseJson');
const { parseDate } = require('../../utils/parseDate');
const ApiError = require('../../utils/ApiError');
const httpStatus = require('../../constants/httpStatus');

const REQUIRED_FIELDS = [
  'account_number',
  'first_name',
  'last_name',
  'email',
  'amount',
  'currency',
  'due_on',
];

/**
 * Handle bulk upload of users and invoices.
 * @param {object} file - Uploaded file (CSV or JSON)
 * @returns {Promise<string>} Success message
 */
const handleBulkUpload = async file => {
  let transaction;

  try {
    const invoices = [];
    const ext = path.extname(file.path).toLowerCase();

    // Parse based on file type
    if (ext === '.csv') {
      await parseCSV(file.path, data => invoices.push(data));
    } else if (ext === '.json') {
      await parseJSON(file.path, data => invoices.push(data));
    } else {
      throw new Error('Unsupported file type.');
    }

    if (!invoices.length) throw new Error('No data found in uploaded file.');

    // Validate required fields
    const missingFields = REQUIRED_FIELDS.filter(field => !invoices[0].hasOwnProperty(field));
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Start DB transaction
    transaction = await sequelize.transaction();

    // Step 1: Identify new users
    const accountNumbers = invoices.map(i => i.account_number);
    const existingUsers = await User.findAll({
      where: { account_number: accountNumbers },
      transaction,
    });

    const existingAccountSet = new Set(existingUsers.map(u => u.account_number));
    const newUsers = invoices.filter(i => !existingAccountSet.has(i.account_number));

    // Step 2: Create new users
    if (newUsers.length > 0) {
      await createUsers(newUsers, transaction);
    }

    // Step 3: Create invoices
    await createInvoices(invoices, transaction);

    await transaction.commit();
    fs.unlinkSync(file.path);

    return 'Bulk invoice creation completed successfully.';
  } catch (err) {
    if (transaction) await transaction.rollback();
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    throw err;
  }
};

/**
 * Create users from invoice rows
 * @param {Array} users - Array of user objects
 * @param {Transaction} transaction - Sequelize transaction
 * @returns {Promise<void>}
 */
const createUsers = async (users, transaction, batch = 100) => {
  for (let i = 0; i < users.length; i += batch) {
    const batchUsers = users.slice(i, i + batch);

    const userInstances = [];

    for (const user of batchUsers) {
      userInstances.push({
        account_number: user.account_number,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email.toLowerCase(),
        password: await bcrypt.hash('123456', 8),
        role: Roles.CUSTOMER,
      });
    }

    await User.bulkCreate(userInstances, {
      transaction,
      updateOnDuplicate: ['first_name', 'last_name', 'updatedAt'],
    });
  }
};

/**
 * Create invoices linked to user.account_number
 * @param {Array} invoiceData - Array of invoice objects
 * @param {Transaction} transaction - Sequelize transaction
 * @returns {Promise<void>}
 */
const createInvoices = async (invoices, transaction, batch = 100) => {
  for (let i = 0; i < invoices.length; i += batch) {
    const batchInvoices = invoices.slice(i, i + batch);

    const invoiceInstances = [];

    for (const invoice of batchInvoices) {
      invoiceInstances.push({
        account_number: invoice.account_number,
        amount: invoice.amount,
        currency: invoice.currency,
        due_on: parseDate(invoice.due_on),
      });
    }

    await Invoice.bulkCreate(invoiceInstances, { transaction });
  }
};

/**
 * add a new invoice and create user if not exists
 * @param {object} invoiceData - Invoice data
 * @returns {Promise<Invoice>} Created invoice instance with user details
 */
const addInvoice = async invoiceData => {
  const { account_number, amount, currency, due_on } = invoiceData;
  const transaction = await sequelize.transaction();

  try {
    // Check if user exists
    let user = await User.findOne({ where: { account_number }, transaction });

    if (user) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'User already exists with this account number.');
    }

    // Create user if not exists
    user = await User.create(
      {
        account_number,
        first_name: invoiceData.first_name,
        last_name: invoiceData.last_name,
        email: invoiceData.email,
        password: invoiceData.password,
        role: invoiceData.role,
      },
      { transaction },
    );

    // Create invoice
    const invoice = await Invoice.create(
      {
        account_number: user.account_number,
        amount,
        currency,
        due_on: parseDate(due_on),
      },
      { transaction },
    );

    await transaction.commit();

    // Return the created invoice instance with user details
    return Invoice.findOne({
      where: { id: invoice.id },
      include: {
        model: User,
        as: 'user',
        attributes: ['account_number', 'first_name', 'last_name', 'email'],
      },
    });
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 * Get all invoices with associated users
 * @returns {Promise<Array>} List of invoices with user details
 */
const getAllInvoices = async () => {
  return Invoice.findAll({
    include: {
      model: User,
      as: 'user',
      attributes: ['account_number', 'first_name', 'last_name', 'email'],
    },
  });
};

module.exports = {
  handleBulkUpload,
  createUsers,
  createInvoices,
  addInvoice,
  getAllInvoices,
};
