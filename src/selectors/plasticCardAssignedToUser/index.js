import createSelector from 'selector';


// import Utils from 'utils';
// import Selectors from 'selectors';

const selectors_cardsCarousel = createSelector('selectors_cardsCarousel',

  state => state.account.cardsIntegration.data.resources.pCards,
  state => state.user.profile.data.item._id,

  (pCards = {}, userId) => {
    return Object.values(pCards).find(card => card.assignedTo === userId);
  }

);

export default selectors_cardsCarousel;


