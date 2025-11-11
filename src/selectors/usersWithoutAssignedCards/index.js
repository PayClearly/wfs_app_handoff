import createSelector from 'selector';

const selectors_usersWithoutAssignedCards = createSelector('selectors_usersWithoutAssignedCards',

  state => state.users.data.items,
  state => state.account.cardsIntegration.data.resources.pCards,

  (users = {}, pCards = {}) => {
    const cardsByAssignment = Object.values(pCards).reduce((acc, card) => {
      acc[card.assignedTo] = card;
      return acc;
    }, {});
    return Object.keys(users).reduce((acc, id) => {
      if (!cardsByAssignment[id]) {

        const user = users[id];
        const label = (user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : user.email;

        acc[id] = {
          ...user,
          label,
        };
      }
      return acc;
    }, {});

  }
);

// helpers

export default selectors_usersWithoutAssignedCards;

