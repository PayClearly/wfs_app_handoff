import createSelector from 'selector';


// Third Party Imports ...


const selectors_paymentIssues = createSelector('selectors_paymentIssues',

  state => state.account.paymentIssues.data.items,

  (paymentIssues = {}) => {
    const pendingPaymentIssues = {};
    const paymentIssuesNotYetSubmittedForWithdrawal = {};
    Object.keys(paymentIssues)
      .forEach((id) => {
        const status = paymentIssues[id]._status;
        if (status === 'pending') {
          pendingPaymentIssues[id] = paymentIssues[id];
        } else if (status === 'resolved' && paymentIssues[id].resolutionCode === '1' && paymentIssues[id]._transferStatus && paymentIssues[id]._transferStatus === 'queued') {
          paymentIssuesNotYetSubmittedForWithdrawal[id] = paymentIssues[id];
        }
      });

    return {
      pendingPaymentIssues,
      paymentIssuesNotYetSubmittedForWithdrawal,
    };
  }
);

export default selectors_paymentIssues;


