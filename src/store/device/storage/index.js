/* eslint no-undef:0 */
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';
import { SecureStorageAPI } from 'api/device';

const namespace = 'DEVICE_STORAGE';
export const actionTypes = createActionTypes(namespace);

const DEFAULT_DATA_STATE = {
  options: undefined,
};

const DEFAULT_COLLECTION_STATE = {
  keys: [],
};

export function _moduleReducers(state = DEFAULT_DATA_STATE, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...DEFAULT_DATA_STATE };
    case actionTypes.initializeSuccess:
      return { ...state, ...action.data };
    default:
      return state;
  }
}

export function _collectionReducers(state = DEFAULT_COLLECTION_STATE, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...DEFAULT_COLLECTION_STATE };
    case actionTypes.updateSuccess:
    case actionTypes.initializeSuccess:
      return { ...state, ...action.collections };
    default:
      return state;
  }
}

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
  collections: _collectionReducers,
});

export default reducer;

// TODO make sure user has secure screen lock set otherwise initialization will fail.
// https://github.com/mibrito707/cordova-plugin-secure-storage-echo#users-must-have-a-secure-screen-lock-set
export function init(options) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.initializeStart });
    try {
      const _keys = await keys()(dispatch, getState);
      dispatch({ type: actionTypes.initializeSuccess, data: { options: options || DEFAULT_DATA_STATE.options }, collections: { keys: _keys } });
    } catch (err) {
      dispatch({ type: actionTypes.initializeError, error: err.message });
    }
  };
}

export function set(key, value) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });
    try {
      await SecureStorageAPI(getState().device.storage.data.options).set(key, value);
      const _keys = await keys()(dispatch, getState);
      dispatch({ type: actionTypes.updateSuccess, collections: { keys: _keys } });
    } catch (err) {
      dispatch({ type: actionTypes.updateError, error: err.message });
    }
  };
}

export function get(key) {
  return (dispatch, getState) => {
    return SecureStorageAPI(getState().device.storage.data.options).get(key);
  };
}

export function keys() {
  return (dispatch, getState) => {
    return SecureStorageAPI(getState().device.storage.data.options).keys();
  };
}

export function remove(key) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });
    try {
      await SecureStorageAPI(getState().device.storage.data.options).remove(key);
      const _keys = await keys()(dispatch, getState);
      dispatch({ type: actionTypes.updateSuccess, collections: { keys: _keys } });
    } catch (err) {
      dispatch({ type: actionTypes.updateError, error: err.message });
    }
  };
}

export function wipe(callback = () => {}) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.deleteStart });
    try {
      const storageKeys = await SecureStorageAPI(getState().device.storage.data.options).keys();
      const keysToRemove = storageKeys.filter((key) => !['auth', 'refresh_token'].includes(key.split('.')[1]));
      keysToRemove.reduce((acc, key) => {
        return acc.then(() => {
          return remove(key.split(`${getState().device.storage.data && getState().device.storage.data.options && getState().device.storage.data.options.keyPrefix || 'payclearly'}.`)[1])(dispatch, getState);
        });
      }, Promise.resolve()).then(() => { dispatch({ type: actionTypes.deleteSuccess }); callback(); });
    } catch (err) {
      dispatch({ type: actionTypes.deleteError, error: err.message });
    }
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
