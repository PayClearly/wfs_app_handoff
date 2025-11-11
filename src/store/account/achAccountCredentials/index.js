import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';

import AccountsAPI from 'api/accounts';

const namespace = 'ACHACCOUNTCREDENTIALS';
export const actionTypes = createActionTypes(namespace);

// Reducer //
export const defaultState = {
  paths: {},
  item: {},
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    case actionTypes.fetchSuccess:
      return { item: action.data };

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
export function update(orgId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });

    return AccountsAPI.updateACHAccountCredentials(orgId, accountId, data)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess, data: {}, paths: {} });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function remove(orgId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.deleteStart });
    return AccountsAPI.deleteACHCredentials(orgId, accountId)
    .then(() => {
      dispatch({ type: actionTypes.deleteSuccess, data: {}, paths: {} });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.deleteError, error: error.response.data.error });
    });
  };
}

export function fetchPrivate(orgId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return AccountsAPI.fetchPrivateAchCreds(orgId, accountId)
    .then((res) => {
      dispatch({ type: actionTypes.fetchSuccess, data: res.data.data });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.fetchError, error: error.response.data.error });
    });
  };
}

export function clear() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clear });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}
