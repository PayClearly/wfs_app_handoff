import createSelector from 'selector';

// Third Party Imports ...

// import Utils from 'utils';
// import Selectors from 'selectors';

const selectors_achFundingSource = createSelector('selectors_achFundingSource',

  state => state.account.achAccountDetails.status.fetched,
  state => state.account.achAccountDetails.data.item,

  (fetched = false, achAccountDetails = {}) => {
    return {
      warning: false,
      loading: !fetched,
      type: achAccountDetails.type,
      name: achAccountDetails.name,
      linked: fetched && !!achAccountDetails.id,
      notLinked: fetched && !achAccountDetails.id,
    };
  }

);

export default selectors_achFundingSource;

// GENERATOR_TYPE='selector';

// private helpers
