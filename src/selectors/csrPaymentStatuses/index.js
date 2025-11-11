/* eslint no-useless-escape:0 */

import createSelector from 'selector';


const selectors_csrPaymentStatuses = createSelector('selectors_csrPaymentStatuses',

  state => state.account.paymentStatuses.data.items,

  (paymentStatuses = {}) => {
    return Object.keys(paymentStatuses).reduce((acc, paymentStatusId) => {
      if (_try(() => paymentStatuses[paymentStatusId].verified.vendor.globalVendorRef)) {
        acc[paymentStatusId] = paymentStatuses[paymentStatusId];
      }

      return acc;
    }, {});
  }
);

export default selectors_csrPaymentStatuses;
