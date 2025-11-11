import createSelector from 'selector';
// import Utils from 'utils';
import Selectors from 'selectors';

const selectors_usersTableData = createSelector('selectors_usersTableData',

  state => state.users.data.items,
  state => Selectors.userRoles(state),

  (users = {}, userRoles = {}) => {
    const usersTableData = {};
    Object.keys(users).forEach((userId) => {
      const user = users[userId];
      const roles = userRoles[userId];

      const adminRole = (roles && roles.admin.split('_')[1]) || 'none';
      const organizationRole = (roles && roles.organization.split('_')[1]) || 'none';
      const accountRole = (roles && roles.account.split('_')[1]) || 'none';


      usersTableData[userId] = {
        ...user,
        // active: user.active !== false || true,
        adminRole,
        organizationRole,
        accountRole,
        notPermissioned: (adminRole === 'none' && accountRole === 'none' && organizationRole === 'none'),
        roles,
      };
    });

    return usersTableData;
  }

);

export default selectors_usersTableData;


