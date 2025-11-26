import createSelector from 'selector';

import Selectors from 'selectors';

const cardHierarchy = {
  CONTRACT_FUEL: 1,
  AVCARD: 2,
  P66_AVCARD: 3,
  BLACK_CARD: 4,
  MASTERCARD: 5,
};
const cardMap = {
  WORLD_FUEL_CONTRACT: 'CONTRACT_FUEL',
  DEFAULT_FUEL_CONTRACT: 'CONTRACT_FUEL',
  ALLIANCE: 'CONTRACT_FUEL',
  AVCARD_BLUE_CARDS: 'AVCARD',
  DEFAULT_AVCARD: 'AVCARD',
  AVCARD: 'AVCARD',
  CONOCO_PHILIPS: 'P66_AVCARD',
  CONOCO_PHILIPS_2: 'P66_AVCARD',
  WORLD_FUEL_UV_CONTRACT: 'BLACK_CARD',
  BANK_CARD: 'MASTERCARD',
};

function mapCardToHierarchy(cardType, cardStock) {
  let cardMapped = cardMap[cardStock] || false;
  if (!cardMapped) {
    cardMapped = cardMap[cardType];
  }
  return cardHierarchy[cardMapped];
}

const selectors_cardsCarousel = createSelector(
  'selectors_cardsCarousel',

  (state) => _resolve(state, 'wfs.cards.data'),
  (state) => _resolve(state, 'wfs.cards.collections.tails'),
  (state) => Selectors.plasticCardAssignedToUser(state),
  (state) => _resolve(state, 'wfs.data.context.tailNumber'),

  (wfCards = {}, tails = {}, pCard = {}, tailNumber) => {

    const cardsToDisplay = (tails[tailNumber] || []).map((id) => wfCards[id]);
    if (pCard._id) {
      const formatted = {
        cardType: 'BANK_CARD',
        cardStock: 'BANK_CARD',
        cardHolderName: pCard.cardHolderName,
        cardNumber: pCard.cardLast4 ? `************${pCard.cardLast4}` : '****************',
        status: pCard.status,
        expirationDate: `${pCard.expireDate.slice(0, 4)}-${pCard.expireDate.slice(4, 6)}`,
      };
      cardsToDisplay.push(formatted);
    }
    // eslint-disable-next-line max-len
    cardsToDisplay.sort((a, b) => mapCardToHierarchy(a.cardType, a.cardStock) - mapCardToHierarchy(b.cardType, b.cardStock));
    return cardsToDisplay;
  }

);

export default selectors_cardsCarousel;

