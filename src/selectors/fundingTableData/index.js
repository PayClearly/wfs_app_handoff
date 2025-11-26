import createSelector from 'selector';

const selectors_fundingTableData = createSelector('selectors_fundingTableData',

  state => state.account.achTransfers.data.items,

  (fundingTransfers = {}) => {
    const fundingTableData = {};
    Object.keys(fundingTransfers).forEach((fundingTransferId) => {
      const transfer = fundingTransfers[fundingTransferId];
      const amount = _try(() => transfer.amount.value, 0);
      const inboundTransfer = Boolean(amount > 0);
      fundingTableData[fundingTransferId] = {
        ...transfer,
        amount,
        active: transfer.status !== 'cancelled',
        transferType: inboundTransfer ? 'deposit' : 'withdrawal',
      };
    });

    return fundingTableData;
  }

);

export default selectors_fundingTableData;

