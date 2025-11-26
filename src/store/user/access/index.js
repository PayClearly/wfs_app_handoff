import { combineReducers } from 'redux';
import Fingerprint from 'fingerprintjs2';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import firebase from 'firebase';

// APIs
import authsApi from 'api/auths';
import oAuthApi from 'api/oAuth';
import * as device from 'store/device';
import * as biometrics from 'store/device/biometrics';
import * as router from 'store/router';
import * as wfs from 'store/wfs';
import base64URLEncoder from 'utils/base64URLEncoder';
import sha256 from 'utils/sha256';

const namespace = 'USERACCESS';
export const actionTypes = createActionTypes(namespace);
// Reducer //
export const defaultState = {
  isLoggedIn: null,
  isGuest: null,
  uid: null,
  jwt: {},
  authState: {},
  signingOut: false,
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    case actionTypes.updateStart:
      return {
        ...state,
        ...action.data,
      };

    case actionTypes.updateSuccess:
      return {
        ...state,
        ...action.data,
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

function _getFingerPrint() {
  return new Promise((resolve) => {
    new Fingerprint().get((hash) => resolve(hash));
  });
}

export function requestOAuthFlow(appName, callback) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });

    const {
      scope,
      state,
      verifier,
      redirectURI,
    } = await device.setOAuthState(appName)(dispatch, getState);
    const challenge = base64URLEncoder(sha256(verifier));
    const mobileApplication = appName === `wfsappDEV${window.GLOBALCERT.WFS_TEST_ENV || ''}`
      || appName === 'wfsappPROD';

    const url = oAuthApi.getAuthorizationCodePath(
      appName,
      {
        scope,
        state,
        challenge,
        redirectURI,
        verifier,
      }
    );

    if (mobileApplication) {
      const browserFinished = () => dispatch({ type: actionTypes.updateSuccess });
      return device.openInAppBrowser(url, { browserFinished })(dispatch, getState);
    }
    return callback(url);
  };
}

// action creators
export function login(data) {
  return async (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    try {
      const fingerprint = await _getFingerPrint();
      const response = await authsApi.login({ ...data, fingerprint });
      await firebase.auth().signInWithCustomToken(response.data.jwt);
      return dispatch({ type: actionTypes.updateSuccess });
    } catch (error) {
      return dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    }
  };
}

export function oAuthLogin(appName, callback) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });
    try {
      const params = getState().router.route.params || {};
      const fingerprint = await _getFingerPrint();
      const mobileApplication = appName === `wfsappDEV${window.GLOBALCERT.WFS_TEST_ENV || ''}`
        || appName === 'wfsappPROD';
      let authState;

      const refreshToken = await device.getRefreshToken()(dispatch, getState) || null;
      // remove the query params so on redirect they do not persist
      router.removeQueryParams(['code', 'state'])(dispatch, getState);

      if (!refreshToken) {
        if (params.code) {
          authState = await device.getOAuthState(params.state)(dispatch, getState);
        } else {
          return requestOAuthFlow(appName)(dispatch, getState);
        }
      }

      const { jwt, oAuth } = await authsApi.oAuthLogin(
        {
          fingerprint,
          authState,
          refreshToken,
          state: params.state,
          code: params.code,
        },
        appName
      );

      if (oAuth.refresh_token) {
        await device.setRefreshToken(oAuth.refresh_token)(dispatch, getState);
      }
      await firebase.auth().signInWithCustomToken(jwt);
      if (mobileApplication) {
        biometrics.setAuthed(true)(dispatch);
      }
      if (callback) {
        await callback(jwt);
      }
      return dispatch({ type: actionTypes.updateSuccess });
    } catch (err) {
      const error = ((err.response || {}).data || {}).error || err.message || err || '';
      const mobileApplication = appName === `wfsappDEV${window.GLOBALCERT.WFS_TEST_ENV || ''}`
        || appName === 'wfsappPROD';
      if (error === 'invalid_grant') {
        await device.removeRefreshToken()(dispatch, getState);
        await device.removeOAuthState()(dispatch, getState);
        const authCallback = mobileApplication ? null : (url) => dispatch(router.exitTo(url));
        return requestOAuthFlow(appName, authCallback)(dispatch, getState);
      }
      return dispatch({ type: actionTypes.updateError, error });
    }
  };
}

export function oAuthLogout(appName, callbackOnly) {
  return async (dispatch, getState) => {
    const { platform } = getState().device.data;
    const mobileApplication = appName === `wfsappDEV${window.GLOBALCERT.WFS_TEST_ENV || ''}`
      || appName === 'wfsappPROD';
    dispatch({ type: actionTypes.updateStart, data: { signingOut: platform.toLowerCase() === 'android' } });
    try {
      const { local } = getState().router;
      const callback = async () => {
        clear()(dispatch, getState);
        wfs.clear()(dispatch, getState);
        await device.removeRefreshToken()(dispatch, getState);
        await device.removeOAuthState()(dispatch, getState);
        await firebase.auth().signOut();
        dispatch({ type: actionTypes.updateSuccess, data: defaultState });
      };
      if (callbackOnly) {
        return callback();
      }
      const { logoutUrl, clientId, returnTo } = oAuthApi.getLogoutInformation(
        appName,
        {
          platform,
          local,
          staging: window.GLOBALCERT.projectId.includes('STAGING-ENV_CHANGE-ME'),
        }
      );

      if (platform === 'web') {
        if (mobileApplication) {
          await callback();
        }
        return device.openInAppBrowser(`${logoutUrl}?client_id=${clientId}&returnTo=${returnTo}`)(dispatch, getState);
      }

      const options = platform === 'iOS' || platform === 'ios' ? { browserPageLoaded: callback } : { browserFinished: callback };
      return device.openInAppBrowser(`${logoutUrl}?client_id=${clientId}&returnTo=${returnTo}`, options)(dispatch, getState);
    } catch (err) {
      const error = ((err.response || {}).data || {}).error || err.message || '';
      dispatch({ type: actionTypes.updateError, error });
    }
  };
}

export function ssoLogout() {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });
    try {
      const { local } = getState().router;
      let wfsLogoutUrl = null;
      let redirectTo = 'https%3A%2F%2Fmyworldcard.wfscorp.com';

      if (local) {
        redirectTo = 'http%3A%2F%2Flocalhost:5005';
        wfsLogoutUrl = `https://kc-lower.wfscorp.com/auth/realms/QA_Ext/protocol/openid-connect/logout?redirect_uri=${redirectTo}&state=isLoggingOut`;
      } else if (window.GLOBALCERT.projectId.includes('STAGING-ENV_CHANGE-ME')) {
        redirectTo = 'https%3A%2F%2Fwfs-staging.CHANGE_ME_STAGING_URL.com';
        wfsLogoutUrl = `https://kc-lower.wfscorp.com/auth/realms/QA_Ext/protocol/openid-connect/logout?redirect_uri=${redirectTo}&state=isLoggingOut`;
      } else {
        wfsLogoutUrl = `https://kc-lower.wfscorp.com/auth/realms/WFS_Prod/protocol/openid-connect/logout?redirect_uri=${redirectTo}&state=isLoggingOut`;
      }

      dispatch(router.exitTo(wfsLogoutUrl));

    } catch (err) {
      const error = ((err.response || {}).data || {}).error || err.message || '';
      dispatch({ type: actionTypes.updateError, error });
    }
  };
}

export function refresh(data) {
  return async (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    try {
      await authsApi.refresh(data);
      dispatch({ type: actionTypes.updateSuccess });
    } catch (err) {
      const error = ((err.response || {}).data || {}).error || err.message || '';
      dispatch({ type: actionTypes.updateError, error });
      throw new Error(error);
    }
  };
}

export function updatePassword(currentPassword, newPassword) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });
    const { uid } = getState().user.access.data;
    return authsApi.update(uid, currentPassword, newPassword)
      .then(() => {
        firebase.auth().signOut();
        dispatch({ type: actionTypes.clear });
      })
      .catch((err) => {
        const error = ((err.response || {}).data || {}).error || err.message || '';
        dispatch({ type: actionTypes.updateError, error });
        throw new Error(error);
      });
  };
}

export function resetPasswordRequest(email) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return authsApi.resetPasswordRequest(email)
      .then(() => {
        dispatch({ type: actionTypes.updateSuccess, data: {} });
      })
      .catch((err) => {
        const error = ((err.response || {}).data || {}).error || err.message || '';
        dispatch({ type: actionTypes.updateError, error });
        throw new Error(error);
      });
  };
}

export function confirmEmail(token, uid, password) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return authsApi.confirmEmail(token, uid, password)
      .then(() => {
        dispatch({ type: actionTypes.updateSuccess, data: {} });
      })
      .catch((err) => {
        const error = ((err.response || {}).data || {}).error || err.message || '';
        dispatch({ type: actionTypes.updateError, error });
        throw new Error(error);
      });
  };
}

export function resetPassword(token, uid, password) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return authsApi.resetPassword(token, uid, password)
      .then(() => {
        dispatch({ type: actionTypes.updateSuccess, data: {} });
      })
      .catch((err) => {
        const error = ((err.response || {}).data || {}).error || err.message || '';
        dispatch({ type: actionTypes.updateError, error });
        throw new Error(error);
      });
  };
}

export function logBackIn(jwtId, email, password) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return authsApi.logBackIn(jwtId, email, password)
      .then(() => {
        dispatch({ type: actionTypes.updateSuccess, data: {} });
      })
      .catch((err) => {
        const error = ((err.response || {}).data || {}).error || err.message || '';
        dispatch({ type: actionTypes.updateError, error });
        throw new Error(error);
      });
  };
}

export function set(data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateSuccess, data });
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

export function logout() {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return authsApi.logout({})
      .then(() => {
        dispatch({ type: actionTypes.updateSuccess });
      })
      .catch((err) => {
        const error = ((err.response || {}).data || {}).error || err.message || '';
        dispatch({ type: actionTypes.updateError, error });
      });
  };
}
