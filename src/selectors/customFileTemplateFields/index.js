import createSelector from 'selector';

const selectors_customFileTemplateFields = createSelector(
  'selectors_customFileTemplateFields',

  (state) => state.account.paymentCustomFields.data.item,

  (paymentCustomFields = {}) => {

    const formattedPaymentCustomFields = Object.values(paymentCustomFields).reduce((acc, field) => {
      acc[field.name] = field.name;
      return acc;
    }, {});

    const lineItemFields = {
      'Line Item - Key': 'pcLine-key',
      'Line Item - Date': 'pcLine-date',
      'Line Item - Invoice #': 'pcLine-invoice',
      'Line Item - Description': 'pcLine-description',
      'Line Item - Balance': 'pcLine-balance',
      'Line Item - Discount': 'pcLine-discount',
      'Line Item - Amount': 'pcLine-amount',
    };

    const erpIntegrationFields = {
      'ERP Vendor': 'erpVendor',
      'ERP Class': 'erpClass',
      'ERP Category': 'erpCategory',
      'ERP Account': 'erpAccount',
    };
    const aliasFields = {
      'Client Name Alias': 'alias-clientName',
    };
    const templateMap = {
      Amount: 'amount',
      'Vendor ID': 'vendorId',
      'Customer Vendor ID': 'customerVendorId',
      'Vendor Name': 'vendorName',
      'Client Name': 'clientName',
      'Payment Method': 'method',
      Vertical: 'globalVendorTagName',
      'Confirmation Number': 'Confirmation Number',
      'Override Fee Rules': 'overrideFeeRules',

      Candidate: 'Candidate',
      'Flight Dates': 'Flight Dates',
      'Media Type': 'Media Type',
      'Agency Name': 'Agency Name',
      'Invoice Number': 'Invoice Number',

      'Rep Email': 'repEmails',
      'Add Email': 'additionalEmails',
      'Card Delivery Email': 'vCardEmails',
      'Card Delivery Fax Number': 'vCardFaxNumbers',
      'Sent Date': 'sentAt',
      Status: 'status',

      ...erpIntegrationFields,

      ...formattedPaymentCustomFields,

      ...lineItemFields,

      ...aliasFields,
    };

    const options = Object.keys(templateMap).reduce((acc, fieldName) => {
      acc[templateMap[fieldName]] = { display: fieldName, key: templateMap[fieldName] };
      return acc;
    }, {});

    return {
      options,
      templateMap,
    };
  }

);

export default selectors_customFileTemplateFields;

