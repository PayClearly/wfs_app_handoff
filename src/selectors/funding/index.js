import createSelector from 'selector';


// Third Party Imports ...

import Utils from 'utils';
import Selectors from 'selectors';

const selectors_funding = createSelector(
  'selectors_funding',
  (state) => state.account.accountBalances.data.item,
  (state) => Selectors.payments(state),
  (state) => Selectors.achFundingSource(state),
  (state) => state.account.achAccountDetails.data.item.fundingPreferences,
  (state) => state.account.paymentStatuses.data.items,
  (state) => state.account.achTransfers.data.items,
  (state) => Selectors.paymentIssues(state),
  (state) => state.account.achAccountDetails.status.fetched,
  (state) => state.account.paymentCardChangeRequests.data.items,
  (state) => state.account.achIntegration.data.details,
  (state) => state.account.checksIntegration.data.details,
  (state) => state.organization.data.id,
  (state) => state.account.data.id,

  (accountBalances = {}, paymentsData = null, achFundingSource = {}, fundingPreferences = {}, paymentStatuses = {}, transfers = {}, paymentIssuesDenorm = {}, achAccountDetailsFetched = false, paymentCardCRs, achIntegration = {}, checksIntegration = {}, organizationId, accountId) => {
    if (!achAccountDetailsFetched || !paymentsData.pendingPayments) {
      return {
        achAccountLinked: null,
        achFundingSource: null,
        automaticFundingEnabled: null,
        automaticFundingType: null,
        earmarkEnforced: null,
        availableFunds: null,
        unfundedPayments: null,
        instantTransfer: null,
        currentTransferPool: 0,
        pendingResolvedIssues: null,
        currentPendingWithdrawalTotal: 0,
      };
    }

    const achAccountLinked = achFundingSource.linked;
    const automaticFundingEnabled = Boolean(fundingPreferences.automaticFundingType);
    const automaticFundingType = fundingPreferences.automaticFundingType;
    const earmarkEnforced = fundingPreferences.fundingStrategy === 'earmark';


    let availableFunds = {};
    let unfundedPayments = {};
    let unfundedPaymentCardChangeRequests = {};
    let currentTransferPool = 0;
    let unfundedPaymentsTotal = 0;
    let unfundedPaymentCardChangeRequestsTotal = 0;
    // calculations for earmark funding (need to know which payments are not funded yet)
    if (earmarkEnforced) {
      let paymentCardChangeRequestsPendingLinkToTransfer = {};
      const paymentsPendingLinkToTransfer = Object.keys(transfers).reduce((acc, transferId) => {
        const transfer = transfers[transferId];
        if (transfer._waitingToLinkToPaymentCardChangeRequests && transfer.status !== 'cancelled') {
          paymentCardChangeRequestsPendingLinkToTransfer = {
            ...paymentCardChangeRequestsPendingLinkToTransfer,
            ...transfer._forPaymentCardChangeRequests
          };
        }
        if (transfer._waitingToLinkToPayments && transfer.status !== 'cancelled') {
          return { ...acc, ...transfer._forPayments };
        }
        return acc;
      }, {});

      // payments
      /**
       * Used later to add payment ids to the funding transfer's
       * `_forPayments` node.
       */
      const paymentsInNeedOfFunding = Object.keys(paymentStatuses).filter((paymentId) => {
        const paymentStatus = paymentStatuses[paymentId];
        const status = paymentStatus._status;
        const isCancelled = status === 'cancelled';
        const notPastFundedStep = status !== 'sending' && status !== 'tracking' && status !== 'tracked';
        const method = _resolve(paymentStatus, 'created.method');
        const isCardPayment = method === 'vCard';
        const linkedToTransfer = _resolve(paymentStatus, 'funded._transferId');
        let waitingForValidTransfer = linkedToTransfer;
        if (linkedToTransfer && _resolve(transfers && transfers[linkedToTransfer], 'status') === 'cancelled') {
          waitingForValidTransfer = false;
        }

        /**
         * Galileo ACH & Check payments are funded from the Master Funding Account,
         * so they are not outside of our internal funding flow like ACH & Check with
         * other providers. So, they need to be counted as "in need of funding".
         */
        const isGalileo = (method === 'check' && checksIntegration.provider === 'GALILEO')
          || (method === 'ACH' && achIntegration.provider === 'GALILEO');

        const inNeedOfFunding = notPastFundedStep
          && !isCancelled
          && (isCardPayment || isGalileo)
          && !waitingForValidTransfer;

        if (inNeedOfFunding) {
          return true;
        }

        return false;
      }).filter((paymentId) => {
        if (paymentsPendingLinkToTransfer[paymentId]) {
          return false;
        }

        return true;
      });

      unfundedPayments = paymentsInNeedOfFunding.reduce((acc, paymentId) => {
        const paymentStatus = paymentStatuses[paymentId];
        const id = paymentStatus._id;
        const amount = _resolve(paymentStatus, 'created.amount');

        currentTransferPool = Utils.addDollars([currentTransferPool, amount]);
        unfundedPaymentsTotal = Utils.addDollars([unfundedPaymentsTotal, amount]);

        acc[id] = amount;
        return acc;
      }, {});

      // payment card change requests
      const paymentCardCRsInNeedOfFunding = Object.keys(paymentCardCRs).filter((paymentCardCRId) => {
        const paymentCardCR = paymentCardCRs[paymentCardCRId];
        const status = paymentCardCR._status;
        const isCancelled = status === 'cancelled';
        const notPastFundedStep = status !== 'processing' && status !== 'processed';
        const isFundingChange = paymentCardCR.fundingAmount && paymentCardCR.fundingAmount > 0;
        const linkedToTransfer = _resolve(paymentCardCR, 'funded._transferId');
        let waitingForValidTransfer = linkedToTransfer;
        if (linkedToTransfer && _resolve(transfers && transfers[linkedToTransfer], 'status') === 'cancelled') {
          waitingForValidTransfer = false;
        }

        if (notPastFundedStep && !isCancelled && !waitingForValidTransfer && isFundingChange) return true;
        return false;
      }).filter((paymentCardCRId) => {
        if (paymentCardChangeRequestsPendingLinkToTransfer[paymentCardCRId]) return false;
        return true;
      });

      unfundedPaymentCardChangeRequests = paymentCardCRsInNeedOfFunding.reduce((acc, paymentCardCRId) => {
        const paymentCardCR = paymentCardCRs[paymentCardCRId];
        const amount = _resolve(paymentCardCR, 'fundingAmount', 0);

        currentTransferPool = Utils.addDollars([currentTransferPool, amount]);
        unfundedPaymentCardChangeRequestsTotal = Utils.addDollars([unfundedPaymentCardChangeRequestsTotal, amount]);

        acc[paymentCardCRId] = amount;
        return acc;
      }, {});

    } else {

      const virtualCardAccount = accountBalances.virtualCardAccount || false;

      const totalPendingAchTransfers = (accountBalances.achs && accountBalances.achs.totalPending) || 0;
      const pendingRefunds = (accountBalances.pendingRefunds && accountBalances.pendingRefunds.totalPending) || 0;
      const resolvedIssuesQueuedForTransfer = (accountBalances.resolvedIssuesQueuedForTransfer
        && accountBalances.resolvedIssuesQueuedForTransfer.totalQueued)
        || 0;

      const paymentCardsBalance = (accountBalances.paymentCards && accountBalances.paymentCards._activeTotal) || 0;
      const totalPendingPaymentCardChangeRequests = Object.keys(_resolve(accountBalances, 'pendingPaymentCardChangeRequests', {})).reduce((total, step) => Utils.addDollars([total, accountBalances.pendingPaymentCardChangeRequests[step].total]), 0);
      // transfer pool calculation
      const inflows = Utils.addDollars([
        virtualCardAccount.availableBalance,
        totalPendingAchTransfers,
      ]);

      const outflows = Utils.addDollars([
        paymentsData.pendingPayments.pendingAmount,
        pendingRefunds,
        paymentCardsBalance,
        resolvedIssuesQueuedForTransfer,
        totalPendingPaymentCardChangeRequests,
      ]);

      const difference = Utils.addDollars([-inflows, outflows]);
      currentTransferPool = difference > 0 ? difference : 0;
      availableFunds = {
        totalCashBalance: virtualCardAccount ? virtualCardAccount.availableBalance - virtualCardAccount.creditLimit : 0,
        totalCreditBalance: virtualCardAccount ? virtualCardAccount.creditLimit : 0,
        availableBalance: virtualCardAccount ? virtualCardAccount.availableBalance : 0,
        totalPosted: paymentsData.pendingPayments.pendingAmount,
        totalPendingAchTransfers,
        currentTransferPool: currentTransferPool > 0 ? currentTransferPool : 0,
        totalAvailable: virtualCardAccount ? Utils.addDollars([virtualCardAccount.availableBalance, (-1 * paymentsData.pendingPayments.pendingAmount), totalPendingAchTransfers, -pendingRefunds, -paymentCardsBalance, -resolvedIssuesQueuedForTransfer]) : 0,
        pendingRefunds,
        paymentCardsBalance,
        resolvedIssuesQueuedForTransfer,
        totalPendingPaymentCardChangeRequests,
      };
    }

    // An object that specifies what to do regarding transfers on payment creation
    const instantTransfer = {
      enabled: achAccountLinked && automaticFundingEnabled && automaticFundingType === 'payment',
      deduct: earmarkEnforced ? 0 : (availableFunds.totalAvailable || 0),
      add: Utils.addDollars(Object.keys(unfundedPayments || {}).map(id => unfundedPayments[id] || 0)),
      otherPayments: unfundedPayments,
      notePrefix: earmarkEnforced ? 'Instant Batch Transfer - ' : 'Instant Standard Transfer - ',
    };

    return {
      achAccountLinked,
      achFundingSource,
      automaticFundingEnabled,
      automaticFundingType,
      earmarkEnforced,
      availableFunds,
      unfundedPayments,
      unfundedPaymentsTotal,
      unfundedPaymentCardChangeRequests,
      unfundedPaymentCardChangeRequestsTotal,
      instantTransfer,
      currentTransferPool,
      pendingResolvedIssues: paymentIssuesDenorm.paymentIssuesNotYetSubmittedForWithdrawal,
      currentPendingWithdrawalTotal: Object.keys(paymentIssuesDenorm.paymentIssuesNotYetSubmittedForWithdrawal).reduce((total, id) => {
        const resolvedIssue = paymentIssuesDenorm.paymentIssuesNotYetSubmittedForWithdrawal[id];
        const issueAmount = resolvedIssue.amount || 0;

        return total + issueAmount;
      }, 0),
    };
  }
);

// };

export default selectors_funding;


