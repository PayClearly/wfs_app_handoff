/* eslint no-undef:0 */
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';
import { BrowserAPI } from 'api/device';

const namespace = 'DEVICE_BROWSER';
export const actionTypes = createActionTypes(namespace);

const DEFAULT_STATE = {
  options: undefined,
};

export function _moduleReducers(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...DEFAULT_STATE };
    case actionTypes.initializeSuccess:
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

export function init(options) {
  return async (dispatch) => {
    dispatch({ type: actionTypes.initializeStart });
    try {
      dispatch({ type: actionTypes.initializeSuccess, data: { options: options || DEFAULT_STATE.options } });
    } catch (err) {
      dispatch({ type: actionTypes.initializeError, error: err.message });
    }
  };
}

export function open(data, options) {
  return async (dispatch, getState) => {
    const browserAPI = await BrowserAPI(getState().device.browser.data.options);
    return browserAPI.open(data, options);
  };
}

export function close() {
  return async (dispatch, getState) => {
    const browserAPI = await BrowserAPI(getState().device.browser.data.options);
    return browserAPI.close();
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
