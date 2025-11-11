/* eslint no-undef:0 */
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';
import { CameraAPI } from 'api/device';

const namespace = 'DEVICE_CAMERA';
export const actionTypes = createActionTypes(namespace);

const DEFAULT_STATE = {
  photo: {
    path: null,
    webPath: null,
  }
};

export function _moduleReducers(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...DEFAULT_STATE };
    case actionTypes.submitSuccess:
      return { ...state, ...action.data };
    case actionTypes.submitError:
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
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.initializeStart });
    try {
      dispatch({ type: actionTypes.initializeSuccess, data: { photo: DEFAULT_STATE.photo } });
    } catch (err) {
      dispatch({ type: actionTypes.initializeError, error: err.message });
    }
  };
}

export function takePhoto() {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.submitStart });
    try {
      const cameraAPI = await CameraAPI();
      const camera = await cameraAPI.takePhoto();
      return dispatch({ type: actionTypes.submitSuccess, data: { photo: { path: camera.path, webPath: camera.webPath } } });
    } catch (err) {
      dispatch({ type: actionTypes.submitError, data: { photo: DEFAULT_STATE.photo }, error: err.message });
    }
  };
}

export function choosePhoto() {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.submitStart });
    try {
      const cameraAPI = await CameraAPI();
      const camera = await cameraAPI.choosePhoto();
      return dispatch({ type: actionTypes.submitSuccess, data: { photo: { path: camera.path, webPath: camera.webPath, dataUrl: camera.dataUrl, format: camera.format } } });
    } catch (err) {
      dispatch({ type: actionTypes.submitError, data: { photo: DEFAULT_STATE.photo }, error: err.message });
    }
  }
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