import createSelector from 'selector';


const selectors_accountsByName = createSelector('selectors_accountsByName',

  state => state.admin.accounts.data.item,
  state => state.organizations.data.items,


  (accounts = {}, organizations = {}) => {

    const accountsByName = {};

    Object.keys(organizations).forEach((orgId) => {
      if (!accounts[orgId]) return;

      const orgAccounts = {};

      Object.keys(accounts[orgId]).forEach((accountId) => {
        const accountName = accounts[orgId][accountId].name;
        orgAccounts[accountName] = accountId;
      });

      accountsByName[orgId] = {
        ...accountsByName[orgId],
        ...orgAccounts,
      };

    });

    return accountsByName;
  }
);

export default selectors_accountsByName;
