import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchNestedValues, retreiveValue, removeListeners } from 'store/_utilities/firebaseHelpers';

const namespace = 'ADMINACCOUNTBALANCES';
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
        // item: _patchState(state.item, Object.keys(action.data)[0], action.data[Object.keys(action.data)[0]]),
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

function _patchState(state, patchKey, patchValue) {
  const keys = patchKey.split('/'); // may need to trim "/"s from beg & end
  const currKey = keys[0];
  if (keys.length === 1) {
    return { ...state, [currKey]: { ...(state[currKey] || {}), ...patchValue } };
  }
  keys.shift();
  return { ...state, [currKey]: { ..._patchState(state[currKey] || {}, keys.join('/'), patchValue) } };
}

// action creators
export function sync() {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return retreiveValue('denormalized/accountBalances', (data, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, data, paths });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().admin.accountBalances.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}
