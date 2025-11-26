import createSelector from 'selector';

const selectors_userRoles = createSelector('selectors_userRoles',

  state => state.users.data.items,
  state => state.admin.roles.data.item,
  state => state.organization.roles.data.items,
  state => state.account.roles.data.items,

  (users = {}, rootRoles = {}, orgRoles = {}, accRoles = {}) => {

    return Object.keys(users).reduce((acc, id) => {
      acc[id] = {
        admin: _toRole(rootRoles[id]),
        organization: _toRole(orgRoles[id]),
        account: _toRole(accRoles[id]),
      };
      return acc;
    }, {});

  }
);

// helpers
function _toRole(userRoles = {}) {
  return (Object.keys(userRoles).length && Object.keys(userRoles)[0]) || 'none';
}

export default selectors_userRoles;

