/* eslint no-undef:0 */
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';

const namespace = 'DEVICE_TOAST';
export const actionTypes = createActionTypes(namespace);

const DEFAULT_STATE = {
  isOpen: false,
  message: '',
  color: 'primary', // supports theme colors
  duration: 5000,
};

export function _moduleReducers(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...DEFAULT_STATE };
    case actionTypes.updateSuccess:
      return { ...state, ...action.data };
    default:
      return state;
  }
}

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
});

export default reducer;

export function show(data) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.updateSuccess, data: { ...data, isOpen: true } });
  };
}

export function dismiss(data) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.updateSuccess, data: DEFAULT_STATE });
  };
}

export function clear() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clear });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}
