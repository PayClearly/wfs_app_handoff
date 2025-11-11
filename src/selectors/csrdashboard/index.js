/* eslint no-useless-escape:0 */

import createSelector from 'selector';

import Selectors from 'selectors';

const selectors_csrDashboard = createSelector(
  'selectors_csrDashboard',

  (state) => state.admin.accountBalances.data.item,
  (state) => state.admin.accounts.data.item,
  (state) => state.organizations.data.items,
  (state) => Selectors.entity('globalVendors_*')(state).canRead,
  (state) => state.admin.opsDashboard.data.items.pendingFTPPayments,
  (state) => state.admin.opsDashboard.data.items.heldFTPPayments,

  (accountBalances, adminAccounts, organizations, canRead, denormPendingFTPPayments, denormHeldFTPPayments) => {

    if (!canRead) {
      return undefined;
    }
    if (!Object.keys(adminAccounts).length
      || !Object.keys(organizations).length
      || !Object.keys(accountBalances).length) {
      return undefined;
    }

    const defaultDenormData = {
      paymentsWithErrors: 0,
      paymentsToBeSent: 0,
      otherPendingPayments: 0,
      paymentsNeedAttention: false,
      paymentsAwaitingAuthorization: 0,
      paymentsWithDeliveryIssues: 0,
      transfersNeedAttention: 0,
      transfersPending: 0,
      itemsNeedAttention: 0,
      itemsForWarning: 0,
      paymentIssues: 0,
      creditLimitSync: 0,
      currentERPErrors: 0,
      paymentsWithCardExpiringSoon: 0,
    };

    const globalDenorm = { ...defaultDenormData };

    const organizationsDenorm = Object.keys(accountBalances).reduce((acc, organizationId) => {

      const organization = organizations[organizationId] || {};
      if (!organization.active || organization.name === 'PayClearly Test') { return acc; }
      const organizationAccountBalances = accountBalances[organizationId];
      const organizationData = { ...defaultDenormData };

      const pendingFTPPayments = _try(() => denormPendingFTPPayments[organizationId], {});
      const heldFTPPayments = _try(() => denormHeldFTPPayments[organizationId], {});

      if (Object.keys(pendingFTPPayments).length) {
        globalDenorm.pendingFTPPayments = true;
        organizationData.pendingFTPPayments = true;
      }
      if (Object.keys(heldFTPPayments).length) {
        globalDenorm.heldFTPPayments = true;
        organizationData.heldFTPPayments = true;
      }

      const accountsData = Object.keys(organizationAccountBalances).reduce((accumulator, accountId) => {
        if (!adminAccounts[organizationId][accountId] || !adminAccounts[organizationId][accountId].active) {
          return accumulator;
        }
        const toReturnAccountLevel = { ...accumulator };
        const accountAchTransferData = accountBalances[organizationId][accountId] && accountBalances[organizationId][accountId].achs || {};
        const accountPaymentStatuses = accountBalances[organizationId][accountId] && accountBalances[organizationId][accountId].paymentStatuses || {};
        const paymentsWithDeliveryIssues = accountBalances[organizationId][accountId] && accountBalances[organizationId][accountId].paymentsWithDeliveryIssues || [];
        const paymentsWithCardExpiringSoon = accountBalances[organizationId][accountId] && accountBalances[organizationId][accountId].paymentsWithCardExpiringSoon || [];
        const pendingRefunds = accountBalances[organizationId][accountId] && accountBalances[organizationId][accountId].pendingRefunds || {};
        const creditLimitSync = accountBalances[organizationId][accountId] && accountBalances[organizationId][accountId].creditLimitSync || {};
        const currentERPErrors = accountBalances[organizationId][accountId] && accountBalances[organizationId][accountId].currentERPErrors || {};


        const accountCalculations = {
          paymentsWithErrors: Object.values(accountPaymentStatuses).reduce((total, step) => {
            if (step.countWithErrors) {
              return total + step.countWithErrors;
            }
            return total;
          }, 0),
          paymentIssues: _try(() => pendingRefunds.paymentsWithIssuesIds.length, 0),
          paymentsToBeSent: _try(() => accountPaymentStatuses.sending.count, 0),
          otherPendingPayments: accountPaymentStatuses.creating.count + accountPaymentStatuses.funding.count + accountPaymentStatuses.verifying.count,
          paymentsAwaitingAuthorization: accountPaymentStatuses.tracking.count,
          paymentsWithDeliveryIssues: paymentsWithDeliveryIssues.length,
          paymentsWithCardExpiringSoon: paymentsWithCardExpiringSoon.length,
          transfersNeedAttention: accountAchTransferData.needsAttentionCount || 0,
          currentERPErrors: currentERPErrors.amount || 0,
          creditLimitSync: Object.keys(creditLimitSync).length ? 1 : 0,
        };


        accountCalculations.paymentsNeedAttention = accountCalculations.paymentsWithErrors + accountCalculations.paymentsToBeSent;
        accountCalculations.transfersPending = (typeof accountCalculations.transfersNeedAttention === 'number' && accountAchTransferData.pendingCount - accountCalculations.transfersNeedAttention) || 0;
        accountCalculations.itemsNeedAttention = accountCalculations.paymentsWithErrors
          + accountCalculations.paymentsToBeSent
          + accountCalculations.transfersNeedAttention
          + accountCalculations.paymentIssues
          + accountCalculations.creditLimitSync
          + accountCalculations.currentERPErrors;
        accountCalculations.itemsForWarning = accountCalculations.paymentsAwaitingAuthorization + accountCalculations.transfersPending + accountCalculations.paymentsWithDeliveryIssues + accountCalculations.paymentsWithCardExpiringSoon;

        Object.keys(accountCalculations).forEach((calculation) => {
          if (accountCalculations[calculation]) {
            organizationData[calculation] += accountCalculations[calculation];
            globalDenorm[calculation] += accountCalculations[calculation];
          }
        });

        toReturnAccountLevel[accountId] = accountCalculations;

        return toReturnAccountLevel;
      }, {});

      acc[organizationId] = { ...organizationData, ...accountsData };

      return acc;
    }, {});

    return { ...globalDenorm, ...organizationsDenorm };
  }
);

export default selectors_csrDashboard;

