import createSelector from 'selector';


import Utils from 'utils';
// import Selectors from 'selectors';

const selectors_batchHistoryTableData = createSelector('selectors_batchHistoryTableData',

  state => state.account.paymentStatuses.data.paymentsByBatch,
  state => state.account.paymentStatuses.data.items,

  (paymentsByBatch = {}, paymentStatuses = {}) => {
    return Object.keys(paymentsByBatch).reduce((acc, batchId) => {
      const paymentsInBatch = paymentsByBatch[batchId] || [];

      const batchMetadata = paymentsInBatch.reduce((bcc, paymentId) => {
        const paymentStatus = paymentStatuses[paymentId];
        let method = _try(() => paymentStatus.created.method);
        if (method) {
          if (_try(() => paymentStatus.created.options.isCommission)) method = 'commission';
          const amount = _try(() => paymentStatus.created.amount, 0);
          bcc.counts[method] += 1;
          bcc.amounts[method] += amount;
          bcc.amounts.total += amount;
        }
        return bcc;
      }, { amounts: { vCard: 0, check: 0, ACH: 0, commission: 0, total: 0 }, counts: { vCard: 0, check: 0, ACH: 0, commission: 0 } });

      batchMetadata.counts.total = paymentsInBatch.length;

      let isFunded = false;
      let status;

      const isTerminalStatus = (status) => [
        'cancelled',
        'tracked',
        'reissued',
        'split-payment',
      ].includes(status);

      const payAt = _try(() => paymentStatuses[paymentsInBatch[0]].created.payAt);
      if (paymentsInBatch.every((paymentId) => { return paymentStatuses[paymentId]._status === 'cancelled'; })) {
        status = 'Cancelled';
      } else if (paymentsInBatch.every((paymentId) => isTerminalStatus(paymentStatuses[paymentId]._status))) {
        status = 'Complete';
        isFunded = true;
      } else {
        const statusIndexAndDisplay = paymentsInBatch.reduce((bcc, paymentId) => {
          if (paymentStatuses[paymentId]._status === 'cancelled') return bcc;
          const paymentStatusIndex = paymentStatuses[paymentId].statusDetails && typeof paymentStatuses[paymentId].statusDetails.indexInProgress === 'number' ? paymentStatuses[paymentId].statusDetails.indexInProgress : -1;

          if (paymentStatusIndex < bcc.index) {
            bcc.index = paymentStatusIndex;
            bcc.display = paymentStatuses[paymentId].statusDetails.status;
          }
          return bcc;
        }, { index: 6, display: '' });

        isFunded = statusIndexAndDisplay.index > 2;
        status = statusIndexAndDisplay.index >= 0 ? statusIndexAndDisplay.display : 'Scheduled';
        // if (status === 'Scheduled') payAt =
      }

      const paymentsWithMemos = paymentsInBatch.filter(paymentId => _try(() => paymentStatuses[paymentId].created.customFields, false));
      let _details = '';
      if (paymentsWithMemos) {
        const allSameMemo = paymentsWithMemos.every((paymentId) => {
          const memo = _try(() => Object.values(paymentStatuses[paymentId].created.customFields).join(' '), '1');
          const firstMemo = _try(() => Object.values(paymentStatuses[paymentsInBatch[0]].created.customFields).join(' '), '2');
          return memo === firstMemo;
        });
        _details = allSameMemo ? _try(() => Object.values(paymentStatuses[paymentsInBatch[0]].created.customFields).join(' ')) : '*Multiples In Batch*';
      }

      acc[batchId] = {
        batchDate: batchId,
        batchId,
        batchMetadata,
        status,
        substatus: status === 'Scheduled' ? Utils.dates.dateToDay(payAt) : status,
        payAt,
        paymentCount: batchMetadata.counts.total,
        paymentsInBatch,
        batchTotal: batchMetadata.amounts.total,
        cardTotal: batchMetadata.amounts.vCard,
        checkTotal: batchMetadata.amounts.check,
        achTotal: batchMetadata.amounts.ACH,
        _createdBy: _try(() => paymentStatuses[paymentsInBatch[0]]._createdBy),
        details: _details,
        actionButton: {
          paymentsInBatch,
          isCancelled: status === 'Cancelled',
          needsFunding: status !== 'Cancelled' && !isFunded,
          batchId,
        },
        isActive: status !== 'Cancelled',
        needsFunding: status !== 'Cancelled' && !isFunded,
      };
      return acc;
    }, {});
  }
);

export default selectors_batchHistoryTableData;


