import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValue, watchValues, removeListeners } from 'store/_utilities/firebaseHelpers';
import { hasPolicy, readableAccounts } from 'store/_utilities/privilegesHelper';
import AccountsAPI from 'api/accounts';

import * as account from 'store/account';

const namespace = 'ACCOUNTS';
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
export function sync(accountId) {
  return (dispatch, getState) => {

    const orgId = getState().organization.data.id;

    // either sync All Of the accounts or just the ones that that the user has read access to
    const hasAllPolicy = hasPolicy(getState().user, 'accounts_idOrganization_*_read', orgId);
    const action = (data, paths) => { dispatch({ type: actionTypes.fetchSuccess, data, paths }); };
    let toWatch;

    dispatch({ type: actionTypes.fetchStart });
    if (hasAllPolicy) {
      toWatch = watchValue(`state/accounts/${orgId}`, action);
    } else {
      toWatch = watchValues(`state/accounts/${orgId}`, readableAccounts(getState().user, orgId), action);
    }
    if (getState().appConfig.data.metadata.name === 'wfsapp') return toWatch;
    return toWatch
    .then(() => {
      return account.sync(accountId)(dispatch, getState);
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    account.clear()(dispatch, getState);
    removeListeners(getState().accounts.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function create(data) {
  return (dispatch, getState) => {
    const organizationId = getState().organization.data.id;
    dispatch({ type: actionTypes.createStart });
    return AccountsAPI.create(organizationId, data)
      .then(() => {
        dispatch({ type: actionTypes.createSuccess });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.createError, error: error.response.data.error });
      });
  };
}

export function update(data) {
  return (dispatch, getState) => {
    const accountId = getState().account.data.id;
    const organizationId = getState().organization.data.id;
    dispatch({ type: actionTypes.updateStart });
    return AccountsAPI.update(organizationId, accountId, data)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function updateAccountOptions(data) {
  return (dispatch, getState) => {
    const accountId = getState().account.data.id;
    const organizationId = getState().organization.data.id;
    dispatch({ type: actionTypes.updateStart });
    return AccountsAPI.updateAccountOptions(organizationId, accountId, data)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}
