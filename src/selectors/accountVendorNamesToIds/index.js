import createSelector from 'selector';


// Third Party Imports ...

// import Utils from 'utils';
// import Selectors from 'selectors';

const selectors_accountVendorNamesToIds = createSelector('selectors_accountVendorNamesToIds',

  state => state.account.accountVendors.data.items,

  (accountVendors = {}) => {
    return Object.keys(accountVendors)
      .reduce((acc, id) => {
        acc[accountVendors[id].name] = id;
        return acc;
      }, {});
  }

);

export default selectors_accountVendorNamesToIds;


