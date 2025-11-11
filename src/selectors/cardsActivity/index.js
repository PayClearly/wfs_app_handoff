import createSelector from 'selector';

import Utils from 'utils';

// Internal Helper Functions ...
function _denormalizeCard(cardData, transactions = {}) {
  const card = {
    declinedCount: 0,
    clearedCount: 0,
    authorizationCount: 0,
    totalAuthorized: 0,
    totalRefunded: 0,
    totalCleared: 0,
    timesUsed: 0,
  };

  Object.values(transactions).forEach((transaction) => {
    const { type } = transaction;

    switch (type) {
      case 'declined':
        card.declinedCount += 1;
        break;
      case 'cleared':
        card.clearedCount += 1;
        card.totalCleared = Utils.addDollars([transaction.amount, card.totalCleared]);
        if (transaction.amount < 0) {
          card.totalRefunded = Utils.addDollars([-transaction.amount, card.totalRefunded]);
        }
        break;
      case 'authorizations':
        if (transaction.transactionType === 'info') { break; } // If it's an info auth, don't count in aggregations
        card.authorizationCount += 1;
        card.totalAuthorized = Utils.addDollars([card.totalAuthorized, transaction.amount]);
        if (transaction.amount > 0) {
          card.timesUsed += 1;
        }
        if (!card.lastUsed || (card.lastUsed && transaction.at > card.lastUsed)) {
          card.lastUsed = transaction.at;
        }
        break;
        default:
          break;
        }
    });

  const isExpired = (Date.now() > cardData.validThrough) && (cardData.status === 'active' || cardData.status === 'on_hold');
  const isUsed = card.timesUsed >= cardData.maxUses;
  const status = ((isExpired || isUsed) && 'cancelled') || cardData.status;
  const unused = Utils.addDollars([cardData.amount, -card.totalAuthorized, card.totalRefunded]);
  const used = Utils.addDollars([card.totalAuthorized, -card.totalRefunded]);
  const remaining = (status !== 'active' && status !== 'on_hold') ? 0 : unused;
  const paymentId = cardData._forPaymentId;
  const paymentCardId = cardData._forPaymentCardId;

  return Object.assign(card, {
    remaining,
    unused,
    used,
    isExpired,
    status,
    paymentId: paymentId || null,
    paymentCardId: paymentCardId || null,
    validThrough: cardData.validThrough,
  });
}

const selectors_cardsActivity = createSelector(
  'selectors_cardsActivity',
  (state) => state.account.cardsIntegration.data.resources.vCards,
  (state) => state.account.cardsIntegration.data.resources.pCards,
  (state) => state.account.cardsIntegration.data.resources.auths,
  (state) => state.account.cardsIntegration.data.resources.clears,
  (state) => state.account.cardsIntegration.data.resources.declines,
  (state) => state.account.cardsIntegration.status.fetched,
  (state) => state.user,
  (state) => state.router,

  (vCards = {}, pCards = {}, auths = {}, clears = {}, declines = {}, fetched = false) => {
    if (!fetched) {
      return {
        totalsByCard: {},
        cardTransactions: {},
        virtualCardsBalance: { remaining: 0, count: 0 },
        loaded: false,
      };
    }

    const all = [];
    const cardTransactions = {};
    const byCard = {};
    const types = { auths, clears, declines };

    Object.keys(vCards || {}).forEach((cardId) => { byCard[cardId] = []; });
    Object.keys(pCards || {}).forEach((cardId) => { byCard[cardId] = []; });

    const typeToActivityType = { auths: 'authorizations', clears: 'cleared', declines: 'declined' };
    ['auths', 'clears', 'declines']
      .forEach((type) => {
        Object.keys(types[type])
          .forEach((id) => {

            const activity = types[type][id];
            const card = vCards[activity.cardId] || pCards[activity.cardId] || {};

            if (!card.id) { return; }

            const item = {
              ...activity,
              transactionType: activity.type,
              type: typeToActivityType[type],
              lastFour: card.cardNumberLastFour || card.cardLast4 || 'xxxx',
              cardNumberLastFour: `*${card.cardNumberLastFour || card.cardLast4 || 'xxxx'}`,
              refId: card._forPaymentId || card._forPaymentCardId || activity.cardId,
            };

            byCard[activity.cardId] = byCard[activity.cardId] || [];

            byCard[activity.cardId].push(item);
            all.push(item);
            cardTransactions[id] = item;
          });
      });

    const totalsByCard = Object.keys(byCard)
      .reduce((acc, cardId) => {
        acc[cardId] = _denormalizeCard(vCards[cardId] || pCards[cardId], byCard[cardId]);
        return acc;
      }, {});

    const virtualCardsBalance = Object.values(totalsByCard).reduce((acc, cardData) => {
      if (
        cardData.timesUsed > 0
        && cardData.totalRefunded === 0
        && !cardData.paymentCardId
        && cardData.status !== 'cancelled'
        && cardData.remaining > 0
        ) {
          acc.remaining = Utils.addDollars([acc.remaining, cardData.remaining]);
          acc.count += 1;
          acc.partiallyUsed = Utils.addDollars([acc.partiallyUsed, cardData.used]);
        }
      return acc;
    }, { remaining: 0, count: 0, partiallyUsed: 0 });

    return {
      all,
      byCard,
      totalsByCard,
      cardTransactions,
      virtualCardsBalance,
      loaded: true,
    };
  }
);


export default selectors_cardsActivity;
