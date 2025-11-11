/* eslint no-undef:0 */
import { SplashScreen } from '@capacitor/splash-screen';
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';
import { BiometricsAPI } from 'api/device';
import jwtDecode from 'jwt-decode';

import * as user from 'store/user';
import * as wfs from 'store/wfs';

import { BackgroundTask } from '@capawesome/capacitor-background-task';

const namespace = 'DEVICE_BIOMETRICS';
export const actionTypes = createActionTypes(namespace);

const DEFAULT_STATE = {
  isAvailable: false,
  options: undefined,
  isAuthed: false,
  lastActive: false,
};

export function _moduleReducers(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...DEFAULT_STATE };
    case actionTypes.initializeSuccess:
      return { ...state, ...action.data };
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
      const biometricsAPI = await BiometricsAPI(options);
      const isAvailable = await biometricsAPI.isAvailable();
      dispatch({
 type: actionTypes.initializeSuccess,
data: {
 isAuthed: false, lastActive: false, isAvailable, options: options || DEFAULT_STATE.options, 
}, 
});
    } catch (err) {
      dispatch({ type: actionTypes.initializeError, error: err.message });
    }
  };
}

export function checkForAvailability() {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.initializeStart });
    try {
      const biometricsAPI = await BiometricsAPI(getState().device.biometrics.data.options);
      const isAvailable = await biometricsAPI.isAvailable();
      dispatch({ type: actionTypes.initializeSuccess, data: { isAvailable } });
    } catch (err) {
      dispatch({ type: actionTypes.initializeError, error: err.message });
    }
  };
}

export function show(data = {}) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.submitStart });
    try {
      const state = getState();
      if (state.device.data.platform === 'web') {
        // since there are no biometrics in the browser then lets just mock this out for development sake :D
        return dispatch({ type: actionTypes.submitSuccess, data: { isAuthed: true, lastActive: false } });
      }
      const biometricsAPI = await BiometricsAPI(getState().device.biometrics.data.options);
      await biometricsAPI.show(data);
      await wfs.refreshToken(async (jwt) => {
        const jwtDecoded = jwtDecode(jwt);
        await user.setAccess({ jwt: jwtDecoded });
      })(dispatch, getState);
      dispatch({ type: actionTypes.submitSuccess, data: { isAuthed: true, lastActive: false } });
    } catch (err) {
      dispatch({ type: actionTypes.submitError, data: { isAuthed: false }, error: err.message });
    } finally {
      // after biometrics are run we always want to hide our splash screen, whether it was successful or not.
      SplashScreen.hide();
    }
  };
}

export function setAuthed(isAuthed) {
  return (dispatch) => {
    dispatch({ type: actionTypes.submitSuccess, data: { isAuthed, lastActive: !isAuthed ? Date.now() : false } });
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
