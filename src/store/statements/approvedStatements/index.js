import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValue, watchValues, removeListeners } from 'store/_utilities/firebaseHelpers';

const namespace = 'APPROVED_STATEMENTS';
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
export function sync() {
  return (dispatch, getState) => {
    const organizationId = getState().organization.data.id;
    const accountId = getState().account.data.id;

    dispatch({ type: actionTypes.fetchStart });
    return watchValue(`denormalized/approvedStatements/${organizationId}/${accountId}`, (items, paths) => { 
      return watchValues(`state/statements/${organizationId}/${accountId}`, Object.keys(items || {}), (data = {}, _paths) => {
        dispatch({ type: actionTypes.fetchSuccess, items: { [organizationId]: { [accountId]: data } }, _paths });
      });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().users.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}
