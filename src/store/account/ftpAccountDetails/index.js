import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValue, removeListeners } from 'store/_utilities/firebaseHelpers';
import AccountsAPI from 'api/accounts';

const namespace = 'FTPACCOUNTDETAILS';
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
      return {
        ...state,
        item: { ...action.item },
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
export function sync(organizationId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchValue(`state/ftpAccountDetails/${organizationId}/${accountId}`, (item, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, item, paths });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.vendors.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function set(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return AccountsAPI.setFtpAccountDetails(organizationId, accountId, data)
    .then(() => {
      dispatch({ type: actionTypes.createSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function update(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return AccountsAPI.updateFtpAccountDetails(organizationId, accountId, data)
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
