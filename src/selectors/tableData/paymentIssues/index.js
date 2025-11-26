import createSelector from 'selector';
import Selectors from 'selectors';

const selectors_tableData_paymentIssues = createSelector(

  (state) => state.account.paymentIssues.data.items,
  (state) => state.account.paymentStatuses.data.items,
  (state) => Selectors.tableData.csrtransfers(state),

  (paymentIssues, paymentStatuses, transfers) => {
    const codeMessageDict = {
      1: 'Funds Remaining',
      2: 'Card refunded',
      3: 'Check returned',
      4: 'Auth expired',
      5: 'Ach debit failed',
    };
    const issuesWData = Object.keys(paymentIssues || {}).reduce((acc, cur) => {
      const paymentIssue = paymentIssues[cur];
      const paymentStatus = paymentStatuses[paymentIssue.paymentId];
      const transfer = _try(() => transfers[paymentIssue._transferId], {});

      acc[cur] = {
        ...paymentIssue,
        code: codeMessageDict[paymentIssue.code],
        paymentRef: paymentStatus.created._ref ? paymentStatus.created._ref : null,
        paymentCreatedAt: paymentStatus.created._at,
        transferRef: transfer._ref ? transfer._ref : null,
        // we only need the formatted versions for the way export currently works, since we want to sort on unformatted refs and
        paymentRefFormat: paymentStatus.created._ref ? `P_${paymentStatus.created._ref}` : '',
        transferRefFormat: transfer._ref ? `T_${transfer._ref}` : '',
      };
      return acc;
    }, {});
    return issuesWData;
  }
);

export default selectors_tableData_paymentIssues;

