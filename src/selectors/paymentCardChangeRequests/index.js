import createSelector from 'selector';


// Third Party Imports ...


const selectors_paymentCardChangeRequests = createSelector(

  state => state.account.paymentCardChangeRequests.data.items,

  (paymentCardChangeRequests = {}) => {
    const paymentCardsWithActiveChangeRequests = {};
    const requestsByPaymentCard = Object.keys(paymentCardChangeRequests).reduce((acc, requestId) => {
      const request = paymentCardChangeRequests[requestId];
      if (!acc[request.paymentCardId]) {
        acc[request.paymentCardId] = { [requestId]: true };
      } else {
        acc[request.paymentCardId][requestId] = true;
      }

      if (request._status !== 'processed' && request._status !== 'cancelled') {
        paymentCardsWithActiveChangeRequests[request.paymentCardId] = true;
      }

      return acc;
    }, {});

    return {
      requestsByPaymentCard,
      paymentCardsWithActiveChangeRequests,
    };
  }
);

export default selectors_paymentCardChangeRequests;


