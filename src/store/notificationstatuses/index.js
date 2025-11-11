import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValues, removeListeners } from 'store/_utilities/firebaseHelpers';

const namespace = 'NOTIFICATIONSTATUSES';
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
export function sync(ids) {
  return (dispatch) => {

    dispatch({ type: actionTypes.fetchStart });
    return watchValues('/state/notificationStatuses', ids, (data, paths) => { dispatch({ type: actionTypes.fetchSuccess, data, paths }); });

  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().users.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}
