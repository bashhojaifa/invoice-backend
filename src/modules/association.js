const User = require('./user/user.entity');
const Invoice = require('./invoice/invoice.entity');

let associationsSet = false;

function setupAssociations() {
  if (associationsSet) return; // prevent duplicate associations
  associationsSet = true;
  User.hasMany(Invoice, {
    foreignKey: 'account_number', // 👈 custom FK
    sourceKey: 'account_number', // 👈 which User field it maps to
    as: 'invoices',
  });

  Invoice.belongsTo(User, {
    foreignKey: 'account_number', // 👈 custom FK in Invoice
    targetKey: 'account_number', // 👈 links to User.account_number
    as: 'user',
  });
}

module.exports = setupAssociations;
