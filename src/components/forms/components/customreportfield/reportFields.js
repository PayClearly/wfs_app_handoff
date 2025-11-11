// eslint-disable-next-line import/prefer-default-export
export const cannedFields = [
  {
    name: 'Card CTS',
    type: 'Num',
    description: 'The card create timestamp. This value is unique to each card.',
  }, {
    name: 'Company Number',
    type: 'Num',
    description: 'The EFS Company number assigned to the customer.',
  }, {
    name: 'Account Number',
    type: 'Num',
    description: 'The EFS Account number assigned to the customer. The customer may have one to many account numbers.',
  }, {
    name: 'Card Group',
    type: 'Num',
    description: 'The Card Group number to which the card belongs.',
  }, {
    name: 'Card Last 4',
    type: 'Num',
    description: 'Last 4 digits of the card number.',
  }, {
    name: 'Card BIN Type',
    type: 'Char',
    description: 'Card Type: MCP = MasterCard Plastic, MCVC = MasterCard Virtual Card, MCGC = MasterCard Ghost Card',
  }, {
    name: 'Cardholder',
    type: 'Char',
    description: 'Cardholder name. Virtual cards are represented with value "Virtual Card".',
  }, {
    name: 'Merchant Category Code (MCC)',
    type: 'Num',
    description: 'Merchant Category Code is a 4 digit code assigned to the merchant by MasterCard.',
  }, {
    name: 'Merchant City',
    type: 'Char',
    description: 'The city of the merchant where the transaction occurred.',
  }, {
    name: 'Merchant DBA',
    type: 'Char',
    description: 'Alternate business name for merchant on file with MasterCard.',
  }, {
    name: 'Merchant ID',
    type: 'Char',
    description: 'Merchant ID assigned to the merchant by MasterCard.',
  }, {
    name: 'Merchant State',
    type: 'Char',
    description: 'The state or province of the merchant where the transaction occurred.',
  }, {
    name: 'Merchant Zip/Postal Code',
    type: 'Char',
    description: 'The zip/postal code of the merchant where the transaction occurred.',
  }, {
    name: 'Country Code',
    type: 'Char',
    description: 'The country code of the merchant where the transaction occurred.',
  }, {
    name: 'Memo Date',
    type: 'Char',
    description: '',
  }, {
    name: 'Memo Time',
    type: 'Num',
    description: '',
  }, {
    name: 'Process Date',
    type: 'Date',
    description: 'The settlement date for the transaction.',
  }, {
    name: 'Process Time',
    type: 'Num',
    description: 'The settlement time for the transaction.',
  }, {
    name: 'Transaction Date',
    type: 'Date',
    description: 'The transaction date for the transaction.',
  }, {
    name: 'Transaction Time',
    type: 'Num',
    description: 'The transaction time for the transaction.',
  }, {
    name: 'Authorization Code',
    type: 'Char',
    description: 'Authorization code assigned by the issuing processor.',
  }, {
    name: 'Clearing Reference Number',
    type: 'Char',
    description: 'Unique identifier assigned to the transaction by the issuing processor. This number is always unique.',
  }, {
    name: 'Cleared Amount',
    type: 'Cur',
    description: 'The settlement amount on the transaction. Credits/Refunds are reflected as negative values.',
  }, {
    name: 'Tax Amount',
    type: 'Cur',
    description: 'The tax amount applied to the transaction.',
  }, {
    name: 'Record Type',
    type: 'Char',
    description: 'The type of transaction record. A = Standard Transaction, R = Reversal, C = Chargeback, S = 2nd Presentment, B = 2nd Chargeback, W = Write-off.',
  }, {
    name: 'Transaction Type',
    type: 'Char',
    description: 'The type of transaction. 0 = Misc, 5 = Retail, 6 = Credit, 8 = Truck Stop.',
  }, {
    name: 'Transaction Currency',
    type: 'Char',
    description: 'The currency the transaction was processed in by the merchant. Represented by the 3 letter currency code (e.g. USD).',
  }, {
    name: 'Exchange Rate',
    type: 'Num',
    description: 'The exchange rate applied to the transaction by MasterCard.',
  }, {
    name: 'Customer Billed Amount',
    type: 'Cur',
    description: 'The total amount billed to the customer, inclusive of fees.',
  }, {
    name: 'Transaction Category Code (TCC)',
    type: 'Char',
    description: 'Transaction Category Code is a single value describing the transaction type. 1 = MAINTENANCE 2 = FUEL 3 = TERMINAL FUEL A = AUTOMOBILE/VEHICLE RENTAL C = CASH DISBURSEMENTS F = RESTAURANT (FOOD) H = HOTEL/MOTEL/CRUISE-SHIP O = COLLEGE/SCHOOL EXPENSE/HOSPITAL R = CARD ACTIVATED TERMINALS/RETAIL SALES T = PRE-AUTHORIZED TRANSACTIONS/MAIL/TELEPHONE/E-COMMERCE U = UNIQUE TRANSACTIONS/CARD ACTIVATED TERMINALS AT TRUCK STOP X = PASSENGER TRANSPORT (AIRLINES/RAILROADS/TRAVEL-AGENCY,ETC.) Z = ATM CASH DISBURSEMENTS.',
  }, {
    name: 'Reference Notes',
    type: 'Char',
    description: '',
  }, {
    name: 'Reference Purchase Order',
    type: 'Char',
    description: '',
  }, {
    name: 'Reference Card #',
    type: 'Num',
    description: '',
  }, {
    name: 'Reference Cardholder Name',
    type: 'Char',
    description: '',
  }, {
    name: 'Reference Vehicle ID',
    type: 'Char',
    description: '',
  }, {
    name: 'Reference Driver ID',
    type: 'Char',
    description: '',
  }, {
    name: 'Reference Driver Number',
    type: 'Num',
    description: '',
  }, {
    name: 'Custom Field 1',
    type: 'Char',
    description: 'User defined custom field.',
  }, {
    name: 'Custom Field 2',
    type: 'Char',
    description: 'User defined custom field.',
  }, {
    name: 'Custom Field 3',
    type: 'Char',
    description: 'User defined custom field.',
  }, {
    name: 'Custom Field 4',
    type: 'Char',
    description: 'User defined custom field.',
  }, {
    name: 'Custom Field 5',
    type: 'Char',
    description: 'User defined custom field.',
  }, {
    name: 'Custom Field 6',
    type: 'Char',
    description: 'User defined custom field.',
  }, {
    name: 'Product Code 1',
    type: 'Char',
    description: '',
  }, {
    name: 'Product Description 1',
    type: 'Char',
    description: '',
  }, {
    name: 'Product Amount 1',
    type: 'Num',
    description: '',
  }, {
    name: 'Product Code 2',
    type: 'Char',
    description: '',
  }, {
    name: 'Prod Description 2',
    type: 'Char',
    description: '',
  }, {
    name: 'Product Amount 2',
    type: 'Num',
    description: '',
  }, {
    name: 'Product Code 3',
    type: 'Char',
    description: '',
  }, {
    name: 'Product Description 3',
    type: 'Char',
    description: '',
  }, {
    name: 'Product Amount 3',
    type: 'Num',
    description: '',
  }, {
    name: 'Product Code 4',
    type: 'Char',
    description: '',
  }, {
    name: 'Product Description 4',
    type: 'Char',
    description: '',
  }, {
    name: 'Product Amount 4',
    type: 'Num',
    description: '',
  }, {
    name: 'Product Code 5',
    type: 'Char',
    description: '',
  }, {
    name: 'Product Description 5',
    type: 'Char',
    description: '',
  }, {
    name: 'Product Amount 5',
    type: 'Num',
    description: '',
  }, {
    name: 'Product Code 6',
    type: 'Char',
    description: '',
  }, {
    name: 'Product Description 6',
    type: 'Char',
    description: '',
  }, {
    name: 'Product Amount 6',
    type: 'Num',
    description: '',
  }, {
    name: 'Customer Code',
    type: 'Char',
    description: 'Customer code entered by merchant at the POS.',
  }, {
    name: 'GL Code',
    type: 'Char',
    description: '',
  }, {
    name: 'GL Description',
    type: 'Char',
    description: '',
  }, {
    name: 'Customer Fee',
    type: 'Cur',
    description: 'Per transaction fee, if applicable.',
  }, {
    name: 'Conversion Fee',
    type: 'Cur',
    description: 'The fee associated with converting one currency to another for a given transaction.',
  }, {
    name: 'Create Date',
    type: 'Date',
    description: 'The date the virtual card was created.',
  }, {
    name: 'Create ID',
    type: 'Char',
    description: 'User ID of the person or service account that created the card.',
  }, {
    name: 'Create Time',
    type: 'Num',
    description: 'The time the virtual card was created.',
  }, {
    name: 'Card Balance',
    type: 'Cur',
    description: 'The balance of the card at the time of report generation.',
  }, {
    name: 'Max Number of Uses',
    type: 'Num',
    description: 'The maximum number of transactions allowed.',
  }, {
    name: 'Transaction Count',
    type: 'Num',
    description: 'The number of transactions that have occurred on this card.',
  }, {
    name: 'Issue Amount',
    type: 'Cur',
    description: 'Amount for which the card was created.',
  }, {
    name: 'Expiration Date',
    type: 'Date',
    description: 'The expiration date associated with the card.',
  }, {
    name: 'Exact Match Flag',
    type: 'Char',
    description: 'Indicates whether the virtual card was set to only allow transactions that exactly matched the issued amount. Y = Exact Match N= No Exact Match.',
  }, {
    name: 'Organization ID',
    type: 'Char',
    description: 'The unique numeric ID assigned to each organization.',
  }, {
    name: 'Account ID',
    type: 'Char',
    description: 'The unique numeric ID assigned to each account in a given organization.',
  }, {
    name: 'Filename',
    type: 'Char',
    description: 'The issuing processor transaction detail file name.',
  }, {
    name: 'File Date',
    type: 'Char',
    description: 'The date on which the issuing transaction detail file was created. ',
  }, {
    name: 'Payment ID',
    type: 'Char',
    description: 'A unique numeric ID assigned to each card.',
  }, {
    name: 'Amount',
    type: 'Cur',
    description: 'The amount issued for a specific card. This represents the limit on the card or payment.',
  }, {
    name: 'Vendor ID',
    type: 'Char',
    description: 'A unique serial number generated for each account vendor.',
  }, {
    name: 'Batch ID',
    type: 'Char',
    description: 'A unique serial number generated for each batch of payments submitted. This will be associated with each payment for any given file you upload.',
  }, {
    name: 'Vendor Name',
    type: 'Char',
    description: 'The name of the account vendor associated with a payment.',
  }, {
    name: 'Payment Method',
    type: 'Char',
    description: 'How the payment was made (e.g. ACH, Credit Card, Check)',
  }, {
    name: 'Card Fees',
    type: 'Num',
    isCustomField: true,
    description: 'Card processing fees required by vendor.',
  }, {
    name: 'Base Payment Amount',
    type: 'Num',
    isCustomField: true,
    description: 'Payment amount less card fees.',
  }];

export const paymentPipelinePreferencesFields = {
  requireConfirmationNumber: {
    fields: [{
      dataField: 'Confirmation Number',
      text: 'Confirmation Number',
      type: 'Char',
      isCustomField: true,
      customFieldType: 'remittance',
    }],
  },
  showInterchangeDataOnTransactionsReport: {
    fields: [{
      dataField: 'Interchange Rate',
      text: 'Interchange Rate',
      type: 'Char',
      isCustomField: false,
    }, {
      dataField: 'Interchange Fee',
      text: 'Interchange Fee',
      type: 'Char',
      isCustomField: false,
    }],
  },
};

// export const customFieldOptions = [, {
//     name: 'Advertiser Number',
//     type: 'Char',
//     description: 'The ID associated with the advertiser submitted with the original payment creation. This is requested by vendors who require the Advertiser ID when processing payments. This does not apply to all payments.',
//   }, {
//     name: 'Agency Name',
//     type: 'Char',
//     description: 'The name of the Agency that was submitted with the original payment creation.',
//   }, {
//     name: 'Candidate',
//     type: 'Char',
//     description: 'The Issue/Candidate/Advertiser submitted with the original payment creation.',
//   }, {
//     name: 'Invoice Number',
//     type: 'Num',
//     description: 'The Invoice number submitted with the original payment creation.',
//   }, {
//     name: 'Market',
//     type: 'Char',
//     description: 'The market for advertisement submitted with the original payment creation.',
//   }, {
//     name: 'Media Type',
//     type: 'Char',
//     description: 'The media type (e.g. TV, Radio, Cable, etc...) submitted with the original payment creation.',
//   }, {
//     name: 'Memo',
//     type: 'Char',
//     description: 'The memo submitted with the original payment creation. This is a free field.',
//   }];
