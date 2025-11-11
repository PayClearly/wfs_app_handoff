import createSelector from 'selector';


// Third Party Imports ...

// import Utils from 'utils';
// import Selectors from 'selectors';

const TransactionsSelector = createSelector(
  state => state.account.paymentStatuses.data.items,
  state => state.account.accountVendors.data.items,
  state => state.users.data.items,
  state => state.account.cardsIntegration.data.resources.vCards,
  state => state.account.cardsIntegration.data.resources.auths,
  state => state.account.cardsIntegration.data.resources.clears,
  state => state.account.cardsIntegration.data.resources.declines,
  state => state.forms['Components.forms.reportsearch'].default._values,
  (paymentStatuses = {}, vendors = {}, users = {}, vCards = null, auths = null, clears = null, declines = null, forms = {}) => {
    /* this code is a bit awkward bit is basically running the equivilent of an outer join of transactions onto payments
    necessary for the recon report, honestly probably not for much else.
    other transaction reports rely upon making a request to pull transactions out of the SQL database, but this one is only
    based on whats inside firebase so using a selector is fine. The selector is a bit slow but only because it waits for a lot
    of data to be synced. honestly if there is ever a point where we dont sync all this data and instead make the report rely
    upon an api request that would be ideal */

    const filteredPayments = Object.keys(paymentStatuses).reduce((acc, cur) => {
      if ((paymentStatuses[cur].created || {})._createdAt > Date.parse(forms.startDate) && (paymentStatuses[cur].created || {})._createdAt < Date.parse(forms.endDate)) {
        acc[cur] = paymentStatuses[cur];
      }
      return acc;
    }, {});

    const [filteredVendors, filteredUsers, filteredVCards] = [
      Object.keys(filteredPayments).reduce((acc, cur) => { acc[cur] = vendors[paymentStatuses[cur].created.vendorId]; return acc; }, {}),
      Object.keys(filteredPayments).reduce((acc, cur) => { acc[cur] = users[paymentStatuses[cur]._createdBy]; return acc; }, {}),
      Object.keys(filteredPayments).reduce((acc, cur) => {
        const vCard = Object.keys(vCards).find(_vCard => vCards[_vCard]._forPaymentId === cur);
        if (vCard) {
          acc[cur] = vCards[vCard];
        }
        return acc;
      }, {}),
    ];

    const [filteredAuths, filteredClears, filteredDeclines] = [
      Object.values(filteredVCards).reduce((acc, { id }) => {
        const auth = Object.keys(auths).find(_auth => auths[_auth].cardId === id);
        if (auth) {
          if (acc[id]) acc[id] = [...acc[id], auths[auth]];
          else acc[id] = [auths[auth]];
        }
        return acc;
      }, {}),
      Object.values(filteredVCards).reduce((acc, { id }) => {
        const clear = Object.keys(clears).find(_clear => clears[_clear].cardId === id);
        if (clear) {
          if (acc[id]) acc[id] = [...acc[id], clears[clear]];
          else acc[id] = [clears[clear]];
        }
        return acc;
      }, {}),
      Object.values(filteredVCards).reduce((acc, { id }) => {
        const decline = Object.keys(declines).find(_decline => declines[_decline].cardId === id);
        if (decline) {
          if (acc[id]) acc[id] = [...acc[id], declines[decline]];
          else acc[id] = [declines[decline]];
        }
        return acc;
      }, {}),
    ];

    const transactions = Object.keys(filteredPayments).reduce((acc, cur) => {
      const vCard = filteredVCards[cur];
      const item = {
        ...filteredPayments[cur],
        user: filteredUsers[cur],
        vendor: filteredVendors[cur],
      };
      let items = [];
      if (vCard) {

        const currentAuths = filteredAuths[vCard.id];
        const currentClears = filteredClears[vCard.id];
        const currentDeclines = filteredDeclines[vCard.id];

        if (currentAuths) {
          items = [...items, ...currentAuths.map((auth) => {
            return {
              ...auth,
              ...item,
              // payments and auths have the amount key, so lets not clobber them
              transactionAmount: auth.amount,
              transactionType: 'auth',
            };
          })];
        }
        if (currentClears) {
          items = [...items, ...currentClears.map((clear) => {
            return {
              ...clear,
              ...item,
              // payments and clears have the amount key, so lets not clobber them
              transactionAmount: clear.amount,
              transactionType: 'clear',
            };
          })];
        }
        if (currentDeclines) {
          items = [...items, ...currentDeclines.map((decline) => {
            return {
              ...decline,
              ...item,
              transactionType: 'decline',
            };
          })];
        }
      }
      // if there were no associated transactions, then we jsut want the payment as a line item
      if (!items.length) items = [item];
      acc.push(...items);
      return acc;
    }, []);
    return transactions;
  }
);

export default TransactionsSelector;



