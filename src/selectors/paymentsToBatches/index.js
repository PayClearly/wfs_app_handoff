import createSelector from 'selector';


// Third Party Imports ...


const selectors_paymentsToBatches = createSelector('selectors_paymentsToBatches',
  state => state.account.paymentStatuses.data.items,

  (paymentStatuses) => {
    return _adaptPaymentsToBatches(paymentStatuses);
  }
);

export default selectors_paymentsToBatches;

// Internal Helper Functions ... 
function _adaptPaymentsToBatches(paymentStatuses = {}) {
  return Object.keys(paymentStatuses).reduce((acc, paymentId) => {
    acc[paymentId] = _try(() => paymentStatuses[paymentId].created._batchId);
    return acc;
  }, {});
}


