const express = require('express');

// Internal imports
const userRoute = require('./user/user.route');
const invoiceRoute = require('./invoice/invoice.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/invoices',
    route: invoiceRoute,
  },
];

defaultRoutes.forEach(route => {
  router.use(route.path, route.route);
});

module.exports = router;
