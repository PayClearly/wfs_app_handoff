import createSelector from 'selector';


const StoredUsers = createSelector(

  state => state.admin.roles.data.item,
  state => state.organization.roles.data.items,
  state => state.account.roles.data.items,

  (rootRoles = {}, orgRoles = {}, accRoles = {}) => {

    const allRoles = Object.keys({ ...rootRoles, ...orgRoles, ...accRoles });
    return allRoles;

  },
);

export default StoredUsers;
