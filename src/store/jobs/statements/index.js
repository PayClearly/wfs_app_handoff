import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchSlice, watchValues, removeListeners, watchValue } from 'store/_utilities/firebaseHelpers';
import StatementsAPI from 'api/statements';

const namespace = 'STATEMENT_JOBS';
export const actionTypes = createActionTypes(namespace);

// Reducer //
export const defaultState = {
  paths: {},
  items: {},
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...state,
        items: { ...action.items },
        paths: { ...action.paths },
      };

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

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
});

export default reducer;

// action creators
export function sync(organizationId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    // return watchValue(`denormalized/approvedStatements/${organizationId}/${accountId}`, (items, paths) => {
    //   return watchValues(`state/jobs/statements/${organizationId}/${accountId}`, Object.keys(items || {}), (_items, _paths) => {
    //     const data = Object.keys(_items).reduce((acc, curr) => {
    //       if (!acc[organizationId]) acc[organizationId] = { [accountId]: {} };
    //       if (!acc[organizationId][accountId]) acc[organizationId][accountId] = {};
    //       acc[organizationId][accountId][curr] = _items[curr];
    //       return acc;
    //     }, {});
    //     dispatch({ type: actionTypes.fetchSuccess, items: data, _paths });
    //   });
    // }).catch((error) => {
    //   dispatch({ type: actionTypes.fetchError, error: error.response.data.error });
    // });
    return watchValue(`state/jobs/statements/${organizationId}/${accountId}`, (items, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, items: { [organizationId]: { [accountId]: items } }, paths });
    }).catch((error) => {
      dispatch({ type: actionTypes.fetchError, error: error.response.data.error });
    });
  };
}

export function fetch(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchSlice(`state/jobs/statements/${organizationId}/${accountId}`, { parameter: 'createdAt', start: data.startDate, end: data.endDate }, (items) => {
      dispatch({ type: actionTypes.fetchSuccess, items: { [organizationId]: { [accountId]: items } } });
    })
    .catch((err) => {
      dispatch({ type: actionTypes.fetchError, error: err.response });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().jobs.statements.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

