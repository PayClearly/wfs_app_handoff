import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValues, removeListeners } from 'store/_utilities/firebaseHelpers';
import { hasPolicy } from 'store/_utilities/privilegesHelper';

import UsersAPI from 'api/user';

import * as accountActions from 'store/account';

const namespace = 'USERS';
export const actionTypes = createActionTypes(namespace);

// Reducer //
export const defaultState = {
  paths: {},
  items: {},
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    case actionTypes.fetchSuccess:
      return {
        ...state,
        items: { ...state.items, ...action.data },
        paths: { ...state.paths, ...action.paths },
      };

    case actionTypes.createSuccess:
      return {
        ...state,
        created: { ...action.data },
      };

    default:
      return state;

  }
}

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
});

export default reducer;

// action creators
export function sync(ids) {
  return (dispatch) => {

    dispatch({ type: actionTypes.fetchStart });
    return watchValues('state/users', ids, (data, paths) => { dispatch({ type: actionTypes.fetchSuccess, data: _adaptFrom(data), paths }); });

  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().users.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function create(data) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.createStart });
    let newuser;
    return UsersAPI.create({ ...data, organizationId: getState().organization.data.id })
    .then((res) => {
      newuser = res.data;

      const user = getState().user;
      const orgContext = getState().organization.data.id;
      const accountContext = getState().account.data.id;

      const acctAccess = hasPolicy(user, 'privileges_grantedTo_idOrganization_idAccount_create', orgContext, accountContext);

      return Promise.all([
        acctAccess ? accountActions.updateAccountRoles(newuser._id, 'base_auditor')(dispatch, getState) : Promise.resolve(),
      ]);

    })
    .then(() => {
      dispatch({ type: actionTypes.createSuccess, data: newuser });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

export function deactivateUser(userId) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.deleteStart });
    return UsersAPI.deletePermissions(userId)
    .then(() => {
      dispatch({ type: actionTypes.deleteSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.deleteError, error: error.response.data.error });
    });
  };
}

export function resendUserInvite(email) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });
    const organizationId = _try(() => getState().organization.data.id);
    return UsersAPI.resendInvite({ email, organizationId })
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess, data: {} });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}
// helpers

const _adaptFrom = (items) => {
  return Object.keys(items || {}).reduce((acc, id) => {
    const user = items[id];
    acc[id] = user;
    acc[id].label = (user.firstName && user.lastName) ? `${user.firstName} ${user.lastName}` : user.email;
    return acc;
  }, {});
};

