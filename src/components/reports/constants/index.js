/**
 * Duplicated from the backend. Should match check
 * activity report types in /src/middlewares/reports/index.js
 */
export const REPORT_TYPES = /** @type {const} */ ({
  CHECK_ACTIVITY: 'checkActivity',
});

export const CHECK_ACTIVITY_FIELDS = [
  { dataField: 'paymentId', text: 'Payment ID', type: 'Num' },
  { dataField: 'amount', text: 'Amount', type: 'Cur' },
  { dataField: 'checkNumber', text: 'Check #', type: 'Num' },
  { dataField: 'billerName', text: 'Biller Name', type: 'Char' },
  { dataField: 'status', text: 'STATUS', type: 'Char' },
  { dataField: 'created', text: 'Created At', type: 'Num' },
  { dataField: 'processed', text: 'Processed At', type: 'Num' },
  { dataField: 'printed', text: 'Printed At', type: 'Num' },
  { dataField: 'cleared', text: 'Cleared At', type: 'Num' },
];

export const PCTR_CARD_FIELDS = [
  { dataField: 'cardCts', text: 'Card CTS', type: 'Char' },
  { dataField: 'companyNumber', text: 'Company Number', type: 'Char' },
  { dataField: 'accountNumber', text: 'Account Number', type: 'Char' },
  { dataField: 'cardBinType', text: 'Card Bin Type', type: 'Char' },
  { dataField: 'customerBilledAmount', text: 'Customer Billed Amount', type: 'Char' },
  { dataField: 'merchantId', text: 'Merchant ID', type: 'Char' },
  { dataField: 'merchantDba', text: 'Merchant DBA', type: 'Char' },
  { dataField: 'countryCode', text: 'Country Code', type: 'Char' },
  { dataField: 'processDate', text: 'Process Date', type: 'Char' },
  { dataField: 'processTime', text: 'Process Time', type: 'Char' },
  { dataField: 'transactionDate', text: 'Transaction Date', type: 'Char' },
  { dataField: 'transactionTime', text: 'Transaction Time', type: 'Char' },
  { dataField: 'authorizationCode', text: 'Authorization Code', type: 'Char' },
  { dataField: 'clearingReferenceNumber', text: 'Clearing Reference Number', type: 'Char' },
  { dataField: 'clearedAmount', text: 'Cleared Amount', type: 'Char' },
  { dataField: 'transactionType', text: 'Transaction Type', type: 'Char' },
  { dataField: 'transactionCurrency', text: 'Transaction Currency', type: 'Char' },
  { dataField: 'interchangeFee', text: 'Interchange Fee', type: 'Char' },
  { dataField: 'interchangeRate', text: 'Interchange Rate', type: 'Char' },
  { dataField: 'interchangeRateDesignator', text: 'Interchange Rate Designator', type: 'Char' },
  { dataField: 'feeProgramIndicator', text: 'Fee Program Indicator', type: 'Char' },
  { dataField: 'transactionCategoryCode', text: 'Transaction Category Code', type: 'Char' },
  { dataField: 'merchantCategoryCode', text: 'Merchant Category Code', type: 'Char' },
  { dataField: 'cardHolder', text: 'Card Holder', type: 'Char' },
  { dataField: 'cardBalance', text: 'Card Balance', type: 'Char' },
  { dataField: 'cardGroup', text: 'Card Group', type: 'Char' },
  { dataField: 'cardLastFour', text: 'Card Last Four', type: 'Char' },
];

export const PCTR_CHECK_FIELDS = [
  { dataField: 'processDate', text: 'Process Date', type: 'Char' },
  { dataField: 'clearedAmount', text: 'Cleared Amount', type: 'Cur' },
  { dataField: 'merchantId', text: 'Merchant ID', type: 'Char' },
  { dataField: 'transactionCurrency', text: 'Transaction Currency', type: 'Char' },
  { dataField: 'checkNumber', text: 'Check Number', type: 'Num' },
  { dataField: 'paymentId', text: 'Payment ID', type: 'Char' },
  { dataField: 'batchId', text: 'Batch ID', type: 'Num' },
  { dataField: 'submittedDate', text: 'Submitted Date', type: 'Char' },
  { dataField: 'vendorId', text: 'Vendor ID', type: 'Char' },
  { dataField: 'vendorName', text: 'Vendor Name', type: 'Char' },
  { dataField: 'paymentMethod', text: 'Payment Method', type: 'Char' },
];

export const PCTR_ACH_FIELDS = [
  { dataField: 'processDate', text: 'Process Date', type: 'Char' },
  { dataField: 'clearedAmount', text: 'Cleared Amount', type: 'Cur' },
  { dataField: 'clearingReferenceNumber', text: 'Clearing Reference Number', type: 'Char' },
  { dataField: 'transactionCurrency', text: 'Transaction Currency', type: 'Char' },
  { dataField: 'transactionId', text: 'Transaction ID', type: 'Char' },
  { dataField: 'status', text: 'Status', type: 'Char' },
  { dataField: 'paymentId', text: 'Payment ID', type: 'Char' },
  { dataField: 'batchId', text: 'Batch ID', type: 'Num' },
  { dataField: 'submittedDate', text: 'Submitted Date', type: 'Char' },
  { dataField: 'vendorId', text: 'Vendor ID', type: 'Char' },
  { dataField: 'vendorName', text: 'Vendor Name', type: 'Char' },
  { dataField: 'paymentMethod', text: 'Payment Method', type: 'Char' },
];
