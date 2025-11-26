import createSelector from 'selector';

import Utils from 'utils';

const selectors_checkNumbers = createSelector('selectors_checkNumbers',

  state => state.account.paymentStatuses.data.items,
  state => state.account.checksIntegration.data.resources.checks,

  (paymentStatuses = {}, checks = {}) => {
    if (Object.keys(checks).length) return undefined;

    const usedCheckNumbers = {};
    Object.values(paymentStatuses).forEach((paymentStatus) => {
      const isCheckPayment = _try(() => paymentStatus.created.method === 'check');
      if (!isCheckPayment) return;
      const isActive = paymentStatus._status !== 'cancelled';
      if (!isActive) return;

      const checkId = _try(() => paymentStatus.sent.thirdPartyPaymentId);
      const check = _try(() => checks[checkId], {});
      const checkNumber = check.checkNumber || _try(() => paymentStatus.created.customFields[Object.keys(paymentStatus.created.customFields).find(key => Utils.sanitizeString(key) === 'checknumber')]);
      if (!checkNumber) return;
      usedCheckNumbers[checkNumber.toString()] = true;
    });

    return usedCheckNumbers;
  }

);

export default selectors_checkNumbers;

