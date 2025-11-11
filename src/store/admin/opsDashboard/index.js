import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import {  watchValue, removeListeners } from 'store/_utilities/firebaseHelpers';

const namespace = 'OPSDASHBOARD';
export const actionTypes = createActionTypes(namespace);

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
        items: { ...action.data },
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
    return watchValue('denormalized/opsDashboard', (data, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, data, paths });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().admin.opsDashboard.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}