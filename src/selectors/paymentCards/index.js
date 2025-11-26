import createSelector from 'selector';

import Selectors from 'selectors';

const selectors_paymentCards = createSelector('selectors_paymentCards',

  state => state.account.paymentCards.data.items,
  state => state.account.paymentCardChangeRequests.data.items,
  state => Selectors.paymentCardChangeRequests(state).requestsByPaymentCard,
  state => state.account.cardsIntegration.data.resources.vCards,
  state => Selectors.cardsActivity(state).totalsByCard,

  (paymentCards = {}, paymentCardChangeRequests = {}, paymentCardRequestsByPaymentCard = {}, vCards = {}, cardsActivityByCard = {}) => {
    const paymentCardsVCardMetadata = Object.keys(paymentCards).reduce((acc, paymentCardId) => {
      const paymentCard = paymentCards[paymentCardId];
      const vCard = _try(() => vCards[paymentCard.vCard]);
      const hasVCard = Boolean(vCard);

      let remainingBalance;
      let amount;
      let validThrough;
      let region;
      let uses;
      let declines;
      let lastFour;

      if (hasVCard) {
        const transactionInformation = cardsActivityByCard[paymentCard.vCard] || {};

        amount = vCard.amount;
        remainingBalance = transactionInformation.remaining || 0;
        validThrough = vCard.validThrough;
        region = vCard.region;
        lastFour = vCard.cardNumberLastFour;
        uses = transactionInformation.authorizationCount || 0;
        declines = transactionInformation.declinedCount || 0;
      } else {
        const paymentCardChangeRequestsForCard = _try(() => Object.keys(paymentCardRequestsByPaymentCard[paymentCardId]), []) || [];
        const createChangeRequest = paymentCardChangeRequestsForCard.length === 1 ? paymentCardChangeRequests[paymentCardChangeRequestsForCard[0]] : _try(() => paymentCardChangeRequests[paymentCardChangeRequestsForCard.find(id => _try(() => paymentCardChangeRequests[id].type === 'create'))]);
        const vCardObject = _try(() => createChangeRequest.created.toWrite, {}) || {};

        amount = vCardObject.amount || 0;
        remainingBalance = vCardObject.amount || 0;
        validThrough = vCardObject.validThrough || 0;
        region = vCardObject.region || 'Unknown';
        lastFour = '***';
        uses = 0;
        declines = 0;
      }

      if (paymentCard.status === 'cancelled') {
        remainingBalance = 0;
      }

      acc[paymentCardId] = {
        remainingBalance,
        amount,
        validThrough,
        region,
        uses,
        declines,
        lastFour,
      };

      return acc;
    }, {});

    return {
      paymentCardsVCardMetadata,
    };
  }
);

export default selectors_paymentCards;

