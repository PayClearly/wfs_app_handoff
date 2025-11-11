import createSelector from 'selector';


import Selectors from 'selectors';

const selectors_paymentCardsTableData = createSelector('selectors_paymentCardsTableData',

  state => state.account.paymentCards.data.items,
  state => state.account.cardsIntegration.data.resources.vCards,
  state => Selectors.cardsActivity(state),
  state => Selectors.paymentCards(state).paymentCardsVCardMetadata,


  (paymentCards = {}, vCards = {}, cardsActivity = {}, paymentCardsVCardMetadata = {}) => {
    const paymentCardsTableData = {};
    Object.keys(paymentCards).forEach((paymentCardId) => {
      const paymentCard = paymentCards[paymentCardId];
      const vCardId = paymentCard.vCard;
      const vCard = _try(() => vCards[vCardId], {});
      const transactionInformation = _try(() => cardsActivity.totalsByCard[vCardId], {});
      const paymentCardVCardMetadata = _try(() => paymentCardsVCardMetadata[paymentCardId], {});

      paymentCardsTableData[paymentCardId] = {
        ...paymentCard,
        ...paymentCard.customFields,
        ...paymentCardVCardMetadata,
        status: vCard.status || paymentCard.status,
        paymentCardRef: paymentCard._ref,
        transactionInformation,
        cancelled: Boolean(_try(() => paymentCard.status === 'cancelled')),
        isActive: !_try(() => paymentCard.status === 'cancelled'),
        totalBilled: _try(() => transactionInformation.used),
        totalCleared: _try(() => transactionInformation.totalCleared),
        lastUsed: _try(() => transactionInformation.lastUsed),
      };
    });

    return paymentCardsTableData;
  }

);

export default selectors_paymentCardsTableData;


