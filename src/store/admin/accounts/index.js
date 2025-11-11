import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValue, removeListeners } from 'store/_utilities/firebaseHelpers';

const namespace = 'ADMINACCOUNTS';
export const actionTypes = createActionTypes(namespace);

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
        item: { ...action.data },
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
export function sync() {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchValue('state/accounts', (data, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, data, paths });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().admin.accounts.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}
