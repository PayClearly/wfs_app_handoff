import createSelector from 'selector';


import Selectors from 'selectors';

const selectors_plasticCardsTableData = createSelector(

  (state) => state.account.cardsIntegration.data.resources.pCards,
  (state) => Selectors.cardsActivity(state),
  (state) => state.user,
  (state) => state.router,

  (plasticCards = {}, cardsActivity = {}) => Object.keys(plasticCards).reduce((acc, plasticCardId) => {

    const plasticCard = plasticCards[plasticCardId];
    const { id, status } = plasticCard;
    const cardLast4 = plasticCard.cardNumberLastFour || plasticCard.cardLast4 || 'xxxx';
    const transactionInformation = _try(() => cardsActivity.totalsByCard[id], {});

    acc[plasticCardId] = {
      ...plasticCard,
      cardLast4,
      activeOrOnHold: status === 'active' || status === 'on_hold',
      transactionInformation,
    };
    return acc;
  }, {})

);

export default selectors_plasticCardsTableData;


