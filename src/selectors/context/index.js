import createSelector from 'selector';

import md5 from 'md5';

// Third Party Imports ...

const selectors_context = createSelector('selectors_context',

  state => _resolve(state, 'organization.data.id'),
  state => _resolve(state, 'account.data.id'),
  state => _resolve(state, 'organizations.data.items'),
  state => _resolve(state, 'accounts.data.items'),

  (organizationId = null, accountId = null, organizations = {}, accounts = {}) => {
    return {
      accountId,
      organizationId,
      account: _try(() => accounts[accountId], {}),
      organization: _try(() => organizations[organizationId], {}),
      isProd: md5(organizationId || '') !== 'c9bcc1da93b4dc7d2003b4536d52a8f0',
      isTest: md5(organizationId || '') === 'c9bcc1da93b4dc7d2003b4536d52a8f0',
    };
  }
);

export default selectors_context;

