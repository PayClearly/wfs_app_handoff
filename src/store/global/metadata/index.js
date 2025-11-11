import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, removeListeners, watchValue } from 'store/_utilities/firebaseHelpers';

const namespace = 'GLOBALVENDORMETADATA';
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
export function sync() {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    watchCollection('state/globalVendors/metadata', (data, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, data, paths });
    }, true);
  };
}

export function syncRelevantData(id) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchValue(`state/globalVendors/metadata/${id}`, (item, path) => {
      if (!item) return dispatch({ type: actionTypes.fetchSuccess });
      dispatch({ type: actionTypes.fetchSuccess, data: { [item._id]: item }, paths: path });
    });
  };
}
export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().global.metadata.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}
