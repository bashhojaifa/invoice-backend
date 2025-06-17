const httpStatus = require('../../constants/httpStatus');
const catchAsync = require('../../utils/catchAsync');
const invoiceService = require('./invoice.service');

/**
 * @desc Bulk upload users and invoices from CSV or JSON file
 * @route POST /api/invoices/bulk-upload
 */
const bulkUpload = catchAsync(async (req, res) => {
  const result = await invoiceService.handleBulkUpload(req.file);

  res.status(httpStatus.OK).json({ success: true, message: result });
});

/**
 * @desc add a new invoice
 * @route POST /api/invoices
 */
const addInvoice = catchAsync(async (req, res) => {
  const invoice = await invoiceService.addInvoice(req.body);

  res.status(httpStatus.CREATED).json({ data: invoice, message: 'Invoice created successfully' });
});

/**
 * @desc get all invoices and their associated users
 * @route GET /api/invoices
 */
const getAllInvoices = catchAsync(async (req, res) => {
  const invoices = await invoiceService.getAllInvoices();
  res.status(httpStatus.OK).json({ data: invoices });
});

module.exports = {
  bulkUpload,
  addInvoice,
  getAllInvoices,
};
