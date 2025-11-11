import { combineReducers } from 'redux';
import { createActionTypes } from 'store/_utilities/statusReducerFactory';

// Import Child Ducks
import * as roles from 'store/admin/roles';
import * as roleDefinitions from 'store/admin/roleDefinitions';
import * as accountBalances from 'store/admin/accountBalances';
import * as accounts from 'store/admin/accounts';
import * as achAccountDetails from 'store/admin/achAccountDetails';
import * as opsDashboard from 'store/admin/opsDashboard';

const namespace = 'ADMIN';
export const actionTypes = createActionTypes(namespace);

const defaultState = {};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {

    default:
      return state;

  }
}

// Reducer
export const reducer = combineReducers({
  data: _moduleReducers,
  roles: roles.reducer,
  roleDefinitions: roleDefinitions.reducer,
  accountBalances: accountBalances.reducer,
  accounts: accounts.reducer,
  achAccountDetails: achAccountDetails.reducer,
  opsDashboard: opsDashboard.reducer,
});

export default reducer;

export function sync() {
  return (dispatch, getState) => {
    const appStoreConfig = _try(() => getState().appConfig.data.store);

    Promise.all([
      { key: 'accounts', actionCreators: accounts },
      { key: 'roles', actionCreators: roles },
      { key: 'roleDefinitions', actionCreators: roleDefinitions },
      { key: 'accountBalances', actionCreators: accountBalances },
      { key: 'achAccountDetails', actionCreators: achAccountDetails },
      { key: 'opsDashboard', actionCreators: opsDashboard },
    ].map((duck) => {
      const { key, actionCreators } = duck;

      if (!_try(() => appStoreConfig.admin[key])) { return Promise.resolve(); }
      return actionCreators.sync()(dispatch, getState);
    }));
  };
}

export function clear() {
  return (dispatch, getState) => {
    accounts.clear()(dispatch, getState);
    roles.clear()(dispatch, getState);
    roleDefinitions.clear()(dispatch, getState);
    accountBalances.clear()(dispatch, getState);
    achAccountDetails.clear()(dispatch, getState);
  };
}

export function updateAdminRoles(userId, role) {
  return (dispatch, getState) => roles.updateRoles('root', userId, role)(dispatch, getState);
}

export function clearErrorsAdminRoles() {
  return (dispatch, getState) => roles.clearErrors()(dispatch, getState);
}
