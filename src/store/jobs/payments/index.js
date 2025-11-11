import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchSlice, watchValue, removeListeners } from 'store/_utilities/firebaseHelpers';

const namespace = 'PAYMENTS_JOBS';
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
        items: action.items,
        paths: { ...action.paths },
      };
    case actionTypes.updateSuccess:
      return {
        ...state,
        items: action.items,
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

export function sync(organizationId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchValue(`state/jobs/payments/${organizationId}/${accountId}`, (items, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, items: { [organizationId]: { [accountId]: items } }, paths });
    }).catch((error) => {
      dispatch({ type: actionTypes.fetchError, error: error.response.data.error });
    });
  };
}

export function fetch(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchSlice(`state/jobs/payments/${organizationId}/${accountId}`, {}, (_data) => {
      dispatch({ type: actionTypes.fetchSuccess, items: { [organizationId]: { [accountId]: _data } } });
    })
    .catch((err) => {
      dispatch({ type: actionTypes.fetchError, error: err.response });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().jobs.reports.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

