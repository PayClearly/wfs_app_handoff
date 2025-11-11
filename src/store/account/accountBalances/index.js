import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValue, removeListeners } from 'store/_utilities/firebaseHelpers';

const namespace = 'ACCOUNTBALANCES_DENROM';
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
export function sync(orgId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchValue(`denormalized/accountBalances/${orgId}/${accountId}`, (item, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, item, paths });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.accountBalances.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}
