import createSelector from 'selector';


// Third Party Imports ...
import numeral from 'numeral';

import Utils from 'utils';
import Selectors from 'selectors';

const selectors_paymentHistoryTableData = createSelector(
  'selectors_paymentHistoryTableData',

  (state) => state.account.paymentStatuses.data.items,
  (state) => state.account.accountVendors.data.items,
  (state) => state.users.data.items,
  (state) => Selectors.paymentIssues(state),
  (state) => state.account.cardsIntegration.data.resources.vCards,
  (state) => state.account.clients,


  (paymentStatuses = {}, vendors = {}, users = {}, paymentIssuesDenorm, vCards = {}, clients = {}) => {
    const clientsData = _resolve(clients, 'data.items', {});
    const clientsCollections = clients.collections || {};

    return Object.keys(paymentStatuses).reduce((acc, paymentId) => {
      const paymentStatus = _try(() => paymentStatuses[paymentId], {});
      const accountVendor = _try(() => vendors[paymentStatus.created.vendorId], {});
      const client = _try(() => clientsData[clientsCollections._ids[paymentStatus.created.clientId]], {});
      const linked = _try(() => paymentStatus.verified.vendor.globalVendorRef);
      const paymentSent = paymentStatus.sent
        && (_try(() => paymentStatus.sent.markedAsReadyToSendOrSent)
          || !_try(() => paymentStatus.sent.waitingToBeMarkedAsSent));

      let status = paymentStatus.status || 'Scheduled';
      if (paymentStatus._status === 'cancelled') {
        status = 'Cancelled';
      }

      const { pendingPaymentIssues } = paymentIssuesDenorm;
      const pendingIssues = (paymentStatus._issueIds || [])
        .filter((issueId) => pendingPaymentIssues[issueId] && pendingPaymentIssues[issueId]._status === 'pending');
      let hasIssues = false;
      if (pendingIssues.length) {
        hasIssues = 'pending';
      } else if (_try(() => paymentStatus._issueIds.length)) {
        hasIssues = 'resolved';
      }

      const createdTime = _try(() => paymentStatus.created._createdAt)
        || _try(() => paymentStatus.created._at) || Date.now();

      const sentTime = (paymentStatus.sent && paymentStatus.sent._at) || '';
      const cardLast4s = (paymentStatus.funded
        && paymentStatus.funded.vCards
        && paymentStatus.funded.vCards.reduce((_acc, cur) => {
          const vCard = vCards[cur.id] || {};
          _acc += `${vCard.cardNumberLastFour}, `;
          return _acc;
        }, ''))
        || '';

      acc[paymentId] = {
        ...paymentStatus,
        created: _try(() => paymentStatus.created) || {},
        vendorName: _try(() => accountVendor.display || paymentStatus.verified.vendor.name),
        clientDisplay: client.display,
        method: _try(() => paymentStatus.created.method),
        formattedAmount: numeral(_try(() => paymentStatus.created.amount)).format('$0,0.00'),
        amount: _try(() => paymentStatus.created.amount, 0),
        createdByProfile: (paymentStatus._createdBy && users[paymentStatus._createdBy]),
        createdTime,
        sentTime,
        formattedDate: Utils.dates.dateToDay(_try(() => paymentStatus.created._at) || Date.now()),
        status,
        isManual: !accountVendor.vCardEmails && !accountVendor.vCardFaxNumbers,
        isActive: paymentStatus._status !== 'cancelled',
        isCommission: _try(() => paymentStatus.created.options.isCommission),
        hasIssues: !!hasIssues,
        hasIssuesStatus: hasIssues,
        hasPendingIssues: hasIssues === 'pending',
        refNumber: paymentStatus._ref,
        formattedRef: paymentStatus._ref ? `P_${paymentStatus._ref}` : '',
        paymentId: paymentStatus._id,
        linked,
        cardLast4s,
        memo: _try(() => paymentStatus.created.customFields.Memo),
        details: _generatePaymentDetails(
          _resolve(paymentStatus, 'created.customFields'),
          _resolve(
            paymentStatus,
            'created.paymentFields'
          )
        ),
        actionButton: {
          id: paymentStatus._id,
          actionTitle: !paymentSent && 'Send',
          beingHandledBy: paymentStatus.sent && paymentStatus.sent.beingHandledBy,
          isCancelled: paymentStatus._status === 'cancelled',
          paymentMethod: _try(() => paymentStatus.created.method),
          vendorIsLinked: linked,
          automatable: paymentStatus.sent && paymentStatus.sent.automatable,
          status: paymentStatus._status,
        },
      };

      return acc;
    }, {});
  }
);

export default selectors_paymentHistoryTableData;

// Internal Helper Functions ...
const _generatePaymentDetails = (customFields, paymentFields) => {
  let details = [];
  if (customFields) { details = details.concat(Object.values(customFields)); }
  if (paymentFields) { details = details.concat(Object.values(paymentFields)); }

  return details.join(' ');
};

