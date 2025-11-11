import { combineReducers } from 'redux';
import { createActionTypes, reducerCreator } from 'store/_utilities/statusReducerFactory';

// Action Creators
import * as accounts from 'store/accounts';

import * as roles from 'store/organization/roles';

const namespace = 'ORGANIZATION';
const info = reducerCreator({ id: null }, namespace);
export const actionTypes = createActionTypes(namespace);

// Reducer
export const reducer = combineReducers({
  data: info.reducer,
  roles: roles.reducer,
});

export default reducer;

export function sync(orgId, accountId) {
  return (dispatch, getState) => {

    const orgItems = getState().organizations.data.items;
    const orgIdPreference = getState().router.route.params.orgId || getState().user.preferences.data.item.orgContext;
    if (!orgItems[orgId]) {
      orgId = '';
      accountId = '';
    }
    const id = orgId // selected org
      || (orgItems[orgIdPreference] && orgIdPreference) // last selected org
      || Object.keys(orgItems)[0]; // first orgIn list

    if (id === getState().organization.data.id) {
      if (accountId) {
        return accounts.sync(accountId)(dispatch, getState); 
      }
      return Promise.resolve();
    }

    clear()(dispatch, getState);

    info.set({ id })(dispatch, getState);
    roles.sync(id)(dispatch, getState);

    return accounts.sync(accountId)(dispatch, getState);

  };
}

export function clear() {
  return (dispatch, getState) => {
    roles.clear()(dispatch, getState);
    info.clear()(dispatch, getState);
    accounts.clear()(dispatch, getState);
  };
}

export function updateOrganizationalRoles(userId, role) {
  return (dispatch, getState) => {
    return roles.updateRoles('organization', userId, role)(dispatch, getState);
  };
}

export function clearErrorsOrganizationRoles() {
  return (dispatch, getState) => {
    return roles.clearErrors()(dispatch, getState);
  };
}
