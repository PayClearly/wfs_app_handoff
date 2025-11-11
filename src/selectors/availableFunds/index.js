import createSelector from 'selector';


import Utils from 'utils';
import Selectors from 'selectors';

const selectors_availableFunds = createSelector(
  'selectors_availableFunds',

  (state) => state.account.accountBalances.data.item,
  (state) => state.account.accountBalances.status.fetched,
  (state) => Selectors.payments(state).pendingPayments,
  (state) => Selectors.cardsActivity(state).virtualCardsBalance,
  (state) => state.account.cardsIntegration.data.details._sync_lastSuccess,
  (state) => state.account.cardsIntegration.data.resources.accounts,
  (state) => state.account.cardsIntegration.status.fetched,

  (accountBalances = {}, accountBalancesFetched, pendingPayments, virtualCardsBalance, integrationLastSync = '', integrationAccount = {}, accountsFetched) => {
    let availableFunds = null;
    if (accountsFetched && accountBalancesFetched) {
      const virtualCardAccount = accountBalances.virtualCardAccount || false;
      const totalCashBalance = (virtualCardAccount && virtualCardAccount.availableBalance) || 0;

      const totalCreditBalance = (accountBalances.virtualCardAccount
        && accountBalances.virtualCardAccount.creditLimit)
        || 0;

      const totalPendingAchTransfers = _resolve(accountBalances, 'achs.totalPending', 0);
      const pendingRefunds = _resolve(accountBalances, 'pendingRefunds.totalPending', 0);
      const resolvedIssuesQueuedForTransfer = _resolve(
        accountBalances,
        'resolvedIssuesQueuedForTransfer.totalQueued',
        0
      );
      const paymentCardsBalance = _resolve(accountBalances, 'paymentCards._activeTotal', 0) < 900000000
        ? _resolve(accountBalances, 'paymentCards._activeTotal', 0)
        : Utils.addDollars([999999999.99, -_resolve(accountBalances, 'paymentCards._activeTotal', 0)]);

      const totalPendingPaymentCardChangeRequests = Object.keys(
        _resolve(accountBalances, 'pendingPaymentCardChangeRequests', {})
      )
        .reduce((total, step) => Utils.addDollars([
          total,
          accountBalances.pendingPaymentCardChangeRequests[step].total,
        ]), 0);

      const totalAvailable = (pendingPayments && virtualCardsBalance)
        ? Utils.addDollars([
          totalCashBalance,
          -pendingPayments.pendingAmountForBalanceWidget,
          virtualCardsBalance.partiallyUsed,
          totalPendingAchTransfers,
          -pendingRefunds,
          -totalPendingPaymentCardChangeRequests,
          -resolvedIssuesQueuedForTransfer,
          virtualCardsBalance.remaining,
        ])
        : 0;

      availableFunds = {
        totalCashBalance,
        totalCreditBalance,
        totalPosted: pendingPayments.pendingAmountForBalanceWidget || 0,
        totalSent: Utils.addDollars([pendingPayments.pendingAmountForBalanceWidget, -virtualCardsBalance.partiallyUsed]),
        totalPendingAchTransfers,
        totalAvailable,
        pendingRefunds,
        paymentCardsBalance,
        virtualCardsBalance: virtualCardsBalance.remaining || 0,
        virtualCardsPartiallyUsed: virtualCardsBalance.partiallyUsed || 0,
        resolvedIssuesQueuedForTransfer,
        totalPendingPaymentCardChangeRequests,
        integrationLastSync,
        creditLimit: (integrationAccount.default && integrationAccount.default.creditLimit) || 0,
        targetCreditLimit: (integrationAccount.default && integrationAccount.default.targetCreditLimit) || 0,
        loaded: true,
      };
    }
    return availableFunds;
  }

);

export default selectors_availableFunds;


