import jwtDecode from 'jwt-decode';
import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import firebase from 'firebase';

import oAuthApi from 'api/oAuth';
import authsApi from 'api/auths';
import * as device from 'store/device';

const namespace = 'USER_OAUTH';
export const actionTypes = createActionTypes(namespace);

const DEFAULT_STATE = {
  decoded: {},
  token: '',
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

export function sync() {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });
    try {
      const refreshToken = await device.getRefreshToken()(dispatch, getState);
      const app = getState().appConfig.data.metadata.name;
      const env = _try(() => (window.GLOBALCERT.projectId === 'payclearly-test' || window.GLOBALCERT.projectId === 'payclearly-staging') && 'DEV' || 'PROD');
      const appName = `${app}${env}${window.GLOBALCERT.WFS_TEST_ENV || ''}`;
      if (!refreshToken) {
        throw Error('User is logged in through firebase but has no refresh token.');
      }

      const { data } = await oAuthApi.fetchAccessTokenUsingRefreshToken(refreshToken, appName);

      await device.setRefreshToken(data.refresh_token)(dispatch, getState);
      return dispatch({ type: actionTypes.updateSuccess, data: { decoded: jwtDecode(data.access_token), token: data.access_token } });
    } catch (err) {
      const error = ((err.response || {}).data || {}).error || err.message || '';
      if (getState().wfs.preferences.data.errorTracing) {
        // device.showToast({ message: error, duration: 1000, color: 'danger' });
      } else {
        // device.showToast({ message: 'Oops! We just encountered an error, Support has been notified', color: 'danger', duration: 5000 })(dispatch);
      }
      dispatch({ type: actionTypes.updateError, error });
    }
  };
}

export function refresh(callback) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });
    try {
      const refreshToken = await device.getRefreshToken()(dispatch, getState);
      const app = getState().appConfig.data.metadata.name;
      const env = _try(() => (window.GLOBALCERT.projectId === 'payclearly-test' || window.GLOBALCERT.projectId === 'payclearly-staging') && 'DEV' || 'PROD');
      const appName = `${app}${env}${window.GLOBALCERT.WFS_TEST_ENV || ''}`;
      if (!refreshToken) {
        throw Error('User is logged in through firebase but has no refresh token.');
      }

      const { jwt, oAuth } = await authsApi.oAuthLogin({ refreshToken }, appName);
      await device.setRefreshToken(oAuth.refresh_token)(dispatch, getState);
      await firebase.auth().signInWithCustomToken(jwt);
      await callback(jwt);
      return dispatch({ type: actionTypes.updateSuccess, data: { decoded: jwtDecode(oAuth.access_token), token: oAuth.access_token } });
    } catch (err) {
      const error = ((err.response || {}).data || {}).error || err.message || '';
      if (getState().wfs.preferences.data.errorTracing) {
        // device.showToast({ message: error, duration: 1000, color: 'danger' });
      } else {
        // device.showToast({ message: 'Oops! We just encountered an error, Support has been notified', color: 'danger', duration: 5000 })(dispatch);
      }
      dispatch({ type: actionTypes.updateError, error });
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
