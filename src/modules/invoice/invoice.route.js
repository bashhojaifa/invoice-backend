const express = require('express');

const router = express.Router();
const invoiceController = require('./invoice.controller');
const upload = require('../../middleware/fileUpload');
const { Roles } = require('../../constants/enums/roles');
const validate = require('../../middleware/validate');
const { createInvoicesValidation } = require('./invoice.validate');
const auth = require('../../middleware/auth');

router.post(
  '/bulk-upload',
  auth([Roles.ADMIN]),
  upload.single('file'),
  invoiceController.bulkUpload,
);

router
  .route('/')
  .get(auth([Roles.ADMIN]), invoiceController.getAllInvoices)
  .post(auth([Roles.ADMIN]), validate(createInvoicesValidation), invoiceController.addInvoice);

module.exports = router;
