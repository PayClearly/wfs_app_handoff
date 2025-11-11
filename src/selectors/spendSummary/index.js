import createSelector from 'selector';


import Selectors from 'selectors';

const selectors_spendSummary = createSelector(

  state => state.account.accountBalances.data.item,
  state => state.account.accountBalances.status,
  state => Selectors.dailyCardsActivity(state),


  (accountBalances = {}, accountBalancesStatus = {}, dailyCardsActivity = {}) => {
    if (!accountBalancesStatus.fetched || !dailyCardsActivity) return null;
    return { ...accountBalances.virtualCardAccount, transferAmount: dailyCardsActivity.authsWithoutClears };
  }

);

export default selectors_spendSummary;


