import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValue, removeListeners } from 'store/_utilities/firebaseHelpers';
import RevenueSharesAPI from 'api/revenueshares';

const namespace = 'CONTRACTS';
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
        items: { ...state.items, ...action.items },
        paths: { ...state.paths, ...action.paths },
      };

    default:
      return state;

  }
}

// Reducer
export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
});

export default reducer;

// action creators
export function sync(organizationId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    if (organizationId && accountId) {
      return watchValue(`state/revenueShares/${organizationId}/${accountId}`, (items, paths) => {
        const data = Object.keys(items || {}).reduce((acc, curr) => {
          if (!acc[organizationId]) acc[organizationId] = { [accountId]: {} };
          if (!acc[organizationId][accountId]) acc[organizationId][accountId] = {};
          acc[organizationId][accountId][curr] = items[curr];
          return acc;
        }, {});
        dispatch({ type: actionTypes.fetchSuccess, items: data, paths });
      });
    }
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().revenueShares.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function update(organizationId, accountId, revenueShareId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return RevenueSharesAPI.update(organizationId, accountId, revenueShareId, data)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function create(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return RevenueSharesAPI.create(organizationId, accountId, data)
    .then(() => {
      dispatch({ type: actionTypes.createSuccess });
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
