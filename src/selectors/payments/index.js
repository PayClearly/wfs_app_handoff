import createSelector from 'selector';

const CARD_METHOD = 'vCard';
const ACH_METHOD = 'ACH';
const CHECK_METHOD = 'check';
const CHANGE_ME_PROVIDER = 'CHANGE_ME_PROVIDER';

function pendingCount(paymentStatusesDenorm, providers) {
  return Object.keys(paymentStatusesDenorm).reduce((total, step) => {
    if (step === '_total') {
      return total;
    }

    let toAdd = parseInt(paymentStatusesDenorm[step].vCardCount, 10);

    if (providers[ACH_METHOD] === CHANGE_ME_PROVIDER) {
      toAdd += parseInt(paymentStatusesDenorm[step].ACHCount, 10);
    }

    if (providers[CHECK_METHOD] === CHANGE_ME_PROVIDER) {
      toAdd += parseInt(paymentStatusesDenorm[step].checkCount, 10);
    }

    return total + toAdd;
  }, 0);
}

function pendingAmount(paymentStatusesDenorm, providers) {
  return Number(parseFloat(Object.keys(paymentStatusesDenorm).reduce((total, step) => {
    if (step === '_total') {
      return total;
    }

    let toAdd = parseFloat(paymentStatusesDenorm[step].vCardTotal);

    if (providers[ACH_METHOD] === CHANGE_ME_PROVIDER) {
      toAdd += parseFloat(paymentStatusesDenorm[step].ACHTotal, 10);
    }

    if (providers[CHECK_METHOD] === CHANGE_ME_PROVIDER) {
      toAdd += parseFloat(paymentStatusesDenorm[step].checkTotal, 10);
    }

    return total + toAdd;
  }, 0)).toFixed(2));
}

function pendingAmountForBalanceWidget(paymentStatusesDenorm, providers) {
  /**
   * After CHANGE_ME_PROVIDER ACH and check payments pass the funding step, funds will have
   * moved out of the MFA into the ACH or Check activity accounts, so at this point
   * funds for these payments should no longer be subtracted from 'total available'
   */
  const pastFundingStep = (step) => step === 'sending' || step === 'tracking';

  return Number(parseFloat(Object.keys(paymentStatusesDenorm).reduce((total, step) => {
    if (step === '_total') {
      return total;
    }

    let toAdd = parseFloat(paymentStatusesDenorm[step].vCardTotal);

    if (providers[ACH_METHOD] === CHANGE_ME_PROVIDER && !pastFundingStep(step)) {
      toAdd += parseFloat(paymentStatusesDenorm[step].ACHTotal, 10);
    }

    if (providers[CHECK_METHOD] === CHANGE_ME_PROVIDER && !pastFundingStep(step)) {
      toAdd += parseFloat(paymentStatusesDenorm[step].checkTotal, 10);
    }

    return total + toAdd;
  }, 0)).toFixed(2));
}

function sentCount(paymentStatusesDenorm, providers) {
  let count = paymentStatusesDenorm.tracking.vCardCount;

  if (providers[ACH_METHOD] === CHANGE_ME_PROVIDER) {
    count += parseInt(paymentStatusesDenorm.tracking.ACHCount, 10);
  }

  if (providers[CHECK_METHOD] === CHANGE_ME_PROVIDER) {
    count += parseInt(paymentStatusesDenorm.tracking.checkCount, 10);
  }

  return count;
}

function sentAmount(paymentStatusesDenorm, providers) {
  let count = paymentStatusesDenorm.tracking.vCardTotal;

  if (providers[ACH_METHOD] === CHANGE_ME_PROVIDER) {
    count += parseFloat(paymentStatusesDenorm.tracking.ACHTotal, 10);
  }

  if (providers[CHECK_METHOD] === CHANGE_ME_PROVIDER) {
    count += parseFloat(paymentStatusesDenorm.tracking.checkTotal, 10);
  }

  return count;
}

function scheduledCount(paymentStatusesDenorm, providers) {
  return Object.keys(paymentStatusesDenorm).reduce((total, step) => {
    if (step === 'tracking' || step === '_total') {
      return total;
    }

    let toAdd = parseInt(paymentStatusesDenorm[step].vCardCount, 10);

    if (providers[ACH_METHOD] === CHANGE_ME_PROVIDER) {
      toAdd += parseInt(paymentStatusesDenorm[step].ACHCount, 10);
    }

    if (providers[CHECK_METHOD] === CHANGE_ME_PROVIDER) {
      toAdd += parseInt(paymentStatusesDenorm[step].checkCount, 10);
    }

    return total + toAdd;
  }, 0);
}

function scheduledAmount(paymentStatusesDenorm, providers) {
  return Object.keys(paymentStatusesDenorm).reduce((total, step) => {
    if (step === 'tracking' || step === '_total') {
      return total;
    }

    let toAdd = parseFloat(paymentStatusesDenorm[step].vCardTotal);

    if (providers[ACH_METHOD] === CHANGE_ME_PROVIDER) {
      toAdd += parseFloat(paymentStatusesDenorm[step].ACHTotal, 10);
    }

    if (providers[CHECK_METHOD] === CHANGE_ME_PROVIDER) {
      toAdd += parseFloat(paymentStatusesDenorm[step].checkTotal, 10);
    }


    return total + toAdd;
  }, 0);
}

const selectors_payments = createSelector(
  'selectors_payments',

  (state) => state.account.paymentStatuses.data.items,
  (state) => state.account.accountBalances.data.item.paymentStatuses,
  (state) => state.account.paymentStatuses.status.fetched,
  (state) => state.account.cardsIntegration.data,
  (state) => state.account.achIntegration.data,
  (state) => state.account.checksIntegration.data,

  (paymentStatuses = {}, paymentStatusesDenorm = {}, paymentStatusesFetched = false, cardsIntegration = {}, achIntegration = {}, checksIntegration = {}) => {
    if (!paymentStatusesDenorm.tracking) { return {}; }

    const providers = {
      [CARD_METHOD]: (cardsIntegration.details && cardsIntegration.details.provider) || null,
      [ACH_METHOD]: (achIntegration.details && achIntegration.details.provider) || null,
      [CHECK_METHOD]: (checksIntegration.details && checksIntegration.details.provider) || null,
    };

    let fundedPayments = [];
    if (paymentStatusesFetched) {
      fundedPayments = Object.keys(paymentStatuses)
        .filter((paymentId) => _resolve(
          paymentStatuses,
          `${paymentId}.funded._at`
        ) && paymentStatuses[paymentId]._status !== 'cancelled');
    }

    const pendingPayments = {
      pendingCount: pendingCount(paymentStatusesDenorm, providers),
      pendingAmount: pendingAmount(paymentStatusesDenorm, providers),
      sentCount: sentCount(paymentStatusesDenorm, providers),
      sentAmount: sentAmount(paymentStatusesDenorm, providers),
      scheduledCount: scheduledCount(paymentStatusesDenorm, providers),
      scheduledAmount: scheduledAmount(paymentStatusesDenorm, providers),
      pendingAmountForBalanceWidget: pendingAmountForBalanceWidget(paymentStatusesDenorm, providers),
    };

    return {
      fundedPayments,
      pendingPayments,
    };
  }
);

export default selectors_payments;
