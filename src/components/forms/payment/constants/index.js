const lineItemFilterConfig = {
  multiFilter: {
    isReady: {
      key: 'isReady',
      type: 'bool',
      display: 'Status',
      valueDisplay: 'Ready',
    },
    amount: {
      key: 'amount',
      type: 'number',
      display: 'Total',
    },
    balance: {
      key: 'balance',
      type: 'number',
      display: 'Balance',
    },
    discount: {
      key: 'discount',
      type: 'number',
      display: 'Discount',
    },
    invoice: {
      key: 'invoice',
      type: 'string',
      display: 'Invoice Number',
    },
  },
};

module.exports = {
  lineItemFilterConfig,
};
