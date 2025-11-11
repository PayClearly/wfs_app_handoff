/* eslint-disable max-len */
import { BackgroundTask } from '@capawesome/capacitor-background-task';
import { getPlatforms } from '@ionic/react';
import { Device } from '@capacitor/device';
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';
import { SplashScreen } from '@capacitor/splash-screen';

// Import Child Ducks
import * as storage from 'store/device/storage';
import * as biometrics from 'store/device/biometrics';
import * as camera from 'store/device/camera';
import * as browser from 'store/device/browser';
import * as geoLocation from 'store/device/geoLocation';
import * as toast from 'store/device/toast';

import base64URLEncoder from '../../utils/base64URLEncoder';
import { getItemsByContext } from '../wfs/_utils';

const namespace = 'DEVICE';

const noBiometricsOnRelaunchEvents = ['openPDF'];

const defaultState = {
  platforms: ['desktop'], // [android, capacitor, cordova, desktop, electron, hybrid, ios, ipad, iphone, mobile, mobileweb, phablet, pwa, tablet]
  platform: 'web', // The device’s operating system name.
  manufacturer: null, // The device's manufacturer.
  model: null, // The name of the device’s model or product. The value is set by the device manufacturer and may be different across versions of the same product.
  serial: null, // The device hardware serial number (SERIAL).
  uuid: null, // The device's Universally Unique Identifier (UUID). The details of how a UUID is generated are determined by the device manufacturer and are specific to the device's platform or model.
  version: null, // The device's operating system version.
  isActive: false, // whether the app is currently active
  lastActive: null, // last time app was opened/closed
  lastUserEventType: null, // Action taken by user when app was closed, used to determine what to do when app is opened again. Checks against noBiometricsOnRelaunchEvents (e.g. 'viewDocument')
};

export const actionTypes = createActionTypes(namespace);

// eslint-disable-next-line default-param-last
export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...state, ...action.items };
    case actionTypes.initializeSuccess:
      return { ...state, ...action.data };
    case actionTypes.updateSuccess:
      return { ...state, ...action.data };
    default:
      return state;
  }
}

export const reducer = combineReducers({
  data: _moduleReducers,
  status: createStatusReducer(namespace),
  storage: storage.reducer,
  biometrics: biometrics.reducer,
  browser: browser.reducer,
  geolocation: geoLocation.reducer,
  toast: toast.reducer,
  camera: camera.reducer,
});

export default reducer;

/**
 * @function Device/init
 * @description initilizes the device duck by gaterhing all of the data associated with the device
 * and adding it to the store
 * @memberOf State
 * @returns {State.Thunk}
 * @instance
*/
export function init() {
  // eslint-disable-next-line consistent-return
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.initializeStart });
    try {
      const {
        model,
        platform,
        uuid,
        version,
        manufacturer,
        serial,
      } = await Device.getInfo();

      const data = {
        model,
        platform: platform || defaultState.platform,
        uuid,
        version,
        manufacturer,
        serial,
        platforms: getPlatforms(),
        isActive: true,
      };

      await storage.init()(dispatch, getState);
      await biometrics.init({ platform: data.platform })(dispatch, getState);
      await browser.init(data)(dispatch, getState);
      await camera.init()(dispatch, getState);
      await geoLocation.init()(dispatch, getState);

      dispatch({ type: actionTypes.initializeSuccess, data });

      // initialize fastclick
      if ('addEventListener' in document && getState().device.isTouchDevice) {
        document.addEventListener('DOMContentLoaded', () => {
          require('fastclick').attach(document.body); // eslint-disable-line global-require
        }, false);
      }
    } catch (err) {
      const error = ((err.response || {}).data || {}).error || err.message || err || '';
      return dispatch({ type: actionTypes.initializeError, error });
    }
  };
}

export function updateData(data) {
  return async (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return dispatch({ type: actionTypes.updateSuccess, data });
  };
}

export function checkIsActive(isActive) {
  // eslint-disable-next-line consistent-return
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });
    const state = getState();

    const { useBiometrics } = state.wfs.preferences.data;
    const { status } = state.device.biometrics;
    await biometrics.checkForAvailability()(dispatch, getState);
    if (!isActive
      && !status.submitting
      && !state.device.camera.status.submitting
      && !state.device.geolocation.status.fetching
      && !state.device.biometrics.status.initializing
      && !state.device.biometrics.status.submitting
      && !state.wfs.status.creating
      && !noBiometricsOnRelaunchEvents.includes(state.device.data.lastUserEventType)
    ) {
      SplashScreen.show();
      if (state.device.data.platform === 'web') {
        return dispatch({ type: actionTypes.updateSuccess, data: { isActive } });
      }
      const taskId = BackgroundTask.beforeExit(async () => {
        dispatch({ type: actionTypes.updateSuccess, data: { isActive } });
        if (useBiometrics) { await biometrics.setAuthed(false)(dispatch); }
        return BackgroundTask.finish({ taskId });
      });
    }
    if (isActive) { dispatch({ type: actionTypes.updateSuccess, data: { isActive } }); }
  };
}

export const biometricsSetAuthed = (isAuthed) => async (dispatch, getState) => {
  try {
    await biometrics.setAuthed(isAuthed)(dispatch, getState);
  } catch (err) {
    // device.showToast({ message: `biometricsSetAuthed: ${err.message}`, color: 'danger' })(dispatch);
  }
};

export function setOAuthState(appName) {
  return async (dispatch, getState) => {
    const verifier = base64URLEncoder();
    const state = base64URLEncoder();
    const scope = 'openid profile email offline_access';
    const { platform } = getState().device.data;
    const { local } = getState().router;

    let redirectURI = null;

    switch (appName) {
      case 'wfsappDEVTest':
      case 'wfsappDEV':
        if (platform === 'web' && local) {
          redirectURI = 'http%3A%2F%localhost%3A5005';
        } else if (platform === 'web' && window.GLOBALCERT.projectId.includes('STAGING-ENV_CHANGE-ME')) {
          redirectURI = 'https%3A%2F%2Fqa.myworldwallet.wfscorp.com';
        } else {
          redirectURI = 'com.wfscorp.mywallet%3A%2F%2Fcallback';
        }
        break;
      case 'wfsappPROD':
        if (platform === 'web') {
          redirectURI = 'https%3A%2F%2Fmyworldwallet.wfscorp.com';
        } else {
          redirectURI = 'com.wfscorp.mywallet%3A%2F%2Fcallback';
        }
        break;
      case 'wfsPROD':
        redirectURI = 'https://myworldcard.wfscorp.com/';
        break;
      case 'wfsDEV':
      default:
        redirectURI = (window.GLOBALCERT.projectId.includes('STAGING-ENV_CHANGE-ME') && !local) ? 'https://qa.myworldcard.wfscorp.com/' : 'http://localhost:5005/';
        break;
    }

    const data = {
      platform,
      redirectURI,
      verifier,
      state,
      scope,
    };

    await storage.set('auth', JSON.stringify(data))(dispatch, getState);
    return data;
  };
}

export function getOAuthState(state) {
  return async (dispatch, getState) => {
    const data = await storage.get('auth')(dispatch, getState).then(({ auth }) => JSON.parse(auth || '{}'));
    if (data.state !== state) { throw new Error('Could not verify OAuth state'); }
    return data;
  };
}

export function removeOAuthState() {
  return async (dispatch, getState) => storage.remove('auth')(dispatch, getState);
}

export function setRefreshToken(refreshToken) {
  return (dispatch, getState) => storage.set('refresh_token', refreshToken)(dispatch, getState);
}

export function getRefreshToken() {
  return async (dispatch, getState) => {
    const data = await storage.get('refresh_token')(dispatch, getState);
    return data.refresh_token;
  };
}

export function removeRefreshToken() {
  return async (dispatch, getState) => storage.remove('refresh_token')(dispatch, getState);
}

export function setCache(prefix, data, options = {}) {
  return async (dispatch, getState) => {
    const ttl = 60 * 60 * 1000; // one hour
    let toReturn = [];

    if (options.indexByItemId && Array.isArray(data)) {
      toReturn = await Promise.all(data.map(async (item) => {
        const id = options.indexByItemId(item);
        const cache = { data: { ...item, _id: id } };
        if (!(options.expires === false)) { cache.expires = Date.now() + (options.ttl || ttl); }
        await storage.set(`${prefix}.${id}`, JSON.stringify(cache))(dispatch, getState);
        return cache.data;
      }));
    } else if (options.indexByItemId) {
      const id = options.indexByItemId(data);
      const cache = { data: { ...data, _id: id } };
      if (!(options.expires === false)) { cache.expires = Date.now() + (options.ttl || ttl); }
      await storage.set(`${prefix}.${id}`, JSON.stringify(cache))(dispatch, getState);
      toReturn = [cache.data];
    } else {
      const cache = { data };
      if (!(options.expires === false)) { cache.expires = Date.now() + (options.ttl || ttl); }
      await storage.set(prefix, JSON.stringify(cache))(dispatch, getState);
      toReturn = [cache.data];
    }
    return toReturn;
  };
}

export function removeCache(key) {
  return async (dispatch, getState) => storage.remove(key)(dispatch, getState);
}

export function getCache(key, options = {}) {
  return async (dispatch, getState) => {
    const _makeRequestAndSetCache = async () => {
      const data = await getItemsByContext(options.query, options.params, getState());
      return setCache(key, data, options)(dispatch, getState);
    };

    // if skipping cache fetch from API
    if (options.skipCache) { return _makeRequestAndSetCache(); }

    // get all entries from cache and check if they are still valid
    const entries = await storage.get(key)(dispatch, getState);
    const totalObjectsInStore = Object.keys(((getState().wfs[key.split('.')[0]] || {}).data || {})).length;

    const cache = Object.keys(entries).reduce((acc, curr) => {
      acc[curr] = JSON.parse(entries[curr] || '{}');
      return acc;
    }, {});

    const isEveryCacheEntryIsValid = Object.keys(cache).length > 0
      && Object.values(cache).every((entry) => entry.data && (!entry.expires || entry.expires > Date.now()));

    // if any of the entries matching the given key are expired invalidate all cache matching given key
    if (!isEveryCacheEntryIsValid && Object.keys(cache).length) {
      await Promise.all(Object.keys(cache).map((k) => removeCache(k)));
    }

    const first = (options.params || {}).first || 0;
    const isMoreEntriesNeeded = first > 0 && Object.keys(cache).length < totalObjectsInStore + first;

    if (isEveryCacheEntryIsValid && !isMoreEntriesNeeded) {
      dispatch({ type: actionTypes.fetchSuccess });
      return Object.values(cache).map((entry) => entry.data);
    }

    // fetch the remaining entries needed to meet sync requirements.
    if (isEveryCacheEntryIsValid && options.query && isMoreEntriesNeeded) { return _makeRequestAndSetCache(); }

    if (options.query) { return _makeRequestAndSetCache(); }

    return null;
  };
}

export function showToast(data) {
  return (dispatch) => {
    toast.show(data)(dispatch);
  };
}

export function wipeCache() {
  return async (dispatch, getState) => storage.wipe(
    () => showToast({ message: 'Cache successfully cleared', color: 'primary', duration: 500 })(dispatch)
  )(dispatch, getState);
}

export function openInAppBrowser(url, options) {
  return (dispatch, getState) => browser.open(url, options)(dispatch, getState);
}

export function showBiometrics() {
  return (dispatch, getState) => biometrics.show({ disableBackup: false })(dispatch, getState);
}

export function closeBrowser() {
  return (dispatch, getState) => browser.close()(dispatch, getState);
}

export function clear() {
  return (dispatch) => {
    biometrics.clear()(dispatch);
    storage.clear()(dispatch);
    browser.clear()(dispatch);
    toast.clear()(dispatch);
    dispatch({ type: actionTypes.clear });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

export function takePhoto() {
  return async (dispatch, getState) => {
    camera.takePhoto()(dispatch, getState);
  };
}

export function choosePhoto() {
  return async (dispatch, getState) => {
    camera.choosePhoto()(dispatch, getState);
  };
}

export function getCurrentLocation() {
  return (dispatch, getState) => {
    geoLocation.getCurrentLocation()(dispatch, getState);
  };
}

export function dismissToast() {
  return (dispatch) => {
    toast.dismiss()(dispatch);
  };
}
