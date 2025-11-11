import { combineReducers } from 'redux';
import firebase from 'firebase';

import * as access from 'store/user/access';
import * as privileges from 'store/user/privileges';
import * as profile from 'store/user/profile';
import * as policies from 'store/user/policies';
import * as roles from 'store/user/roles';
import * as preferences from 'store/user/preferences';
import * as twoFactorAuth from 'store/user/twofactorauth';
import * as privateMetadata from 'store/user/privatemetadata';
import * as userTermsAndConditions from 'store/user/usertermsandconditions';

import * as organizations from 'store/organizations';
import * as account from 'store/account';
import * as users from 'store/users';
import * as admin from 'store/admin';
import * as cloudFunctionStatus from 'store/cloudfunctionstatus';
import * as router from 'store/router';
import * as global from 'store/global';
import * as integrationDefinitions from 'store/integrationDefinitions';
import * as eventDefinitions from 'store/eventDefinitions';
import TwoFactorAuthAPI from 'api/twofactorauth';
import * as termsAndConditions from 'store/termsandconditions';
import * as revenueShares from 'store/revenueshares';
import * as jobs from 'store/jobs';
import * as wfs from 'store/wfs';

import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';

const namespace = 'USER';
export const actionTypes = createActionTypes(namespace);

const reducers = {
  access,
  privileges,
  policies,
  roles,
  profile,
  preferences,
  twoFactorAuth,
  privateMetadata,
  wfs,
};

// Reducer
export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  ...Object.keys(reducers).reduce((acc, cur) => {
    acc[cur] = reducers[cur].reducer;
    return acc;
  }, {}),
});

export default reducer;

export function logout(skipAPI) {
  return async (dispatch, getState) => {
    await (skipAPI ? Promise.resolve() : access.logout()(dispatch, getState));
    return firebase.auth().signOut();
  };
}

export function ssoLogout() {
  return async (dispatch, getState) => access.ssoLogout()(dispatch, getState);
}

export function oAuthLogout(appName, callbackOnly) {
  return async (dispatch, getState) => access.oAuthLogout(appName, callbackOnly)(dispatch, getState);
}

export function refreshToken(data) {
  return (dispatch, getState) => access.refresh(data)(dispatch, getState);
}

export function login(data) {
  return async (dispatch, getState) => access.login(data)(dispatch, getState);
}

export function oAuthLogin(appName, callback) {
  return (dispatch, getState) => access.oAuthLogin(appName, callback)(dispatch, getState);
}

export function oAuthAuthorization(appName, callback) {
  return async (dispatch, getState) => access.requestOAuthFlow(appName, callback)(dispatch, getState);
}

export function logBackIn(jwtId, email, password) {
  return (dispatch, getState) => access.logBackIn(jwtId, email, password)(dispatch, getState);
}

export function updatePassword(currentPassword, newPassword) {
  return (dispatch, getState) => access.updatePassword(currentPassword, newPassword)(dispatch, getState);
}

export function setAccess(data) {
  return (dispatch, getState) => access.set(data)(dispatch, getState);
}

export function sync(params = {}) {
  const { uid, desiredContext } = params;
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.initializeStart });
    const userId = getState().user.access.data.uid || uid;
    const app = getState().appConfig.data.metadata.name;
    await Promise.all([
      profile.sync(userId)(dispatch, getState),
      privileges.sync(userId)(dispatch, getState),
      policies.sync(userId)(dispatch, getState),
      roles.sync(userId)(dispatch, getState),
      preferences.sync(userId)(dispatch, getState),
      privateMetadata.sync(userId)(dispatch, getState),
      integrationDefinitions.sync()(dispatch),
      eventDefinitions.sync()(dispatch),
    ]);

    await organizations.sync(desiredContext)(dispatch, getState);

    await Promise.all([
      admin.sync()(dispatch, getState),
      cloudFunctionStatus.sync()(dispatch, getState),
      global.sync()(dispatch, getState),
      termsAndConditions.syncLatest()(dispatch),
      app === 'wfsapp' ? wfs.sync()(dispatch, getState) : Promise.resolve(),
    ]);

    if (app === 'wfsapp') {
      const { context } = getState().wfs.data;
      if (context.customerNumber) {
        const accounts = Object.values(getState().accounts.data.items).filter((account) => account.externalId.split(':')[0] === `${context.customerNumber}`);
        const accountId = accounts.length === 1 ? accounts[0]._id : '';
        if (accountId) {
          await account.sync(accountId)(dispatch, getState);
          await wfs.syncAdhocTrips()(dispatch, getState);
        }
      }
    }

    return dispatch({ type: actionTypes.initializeSuccess });
  };
}

export function clear() {
  return (dispatch, getState) => {
    privileges.clear()(dispatch, getState);
    access.clear()(dispatch, getState);
    profile.clear()(dispatch, getState);
    admin.clear()(dispatch, getState);
    cloudFunctionStatus.clear()(dispatch, getState);
    organizations.clear()(dispatch, getState);
    roles.clear()(dispatch, getState);
    preferences.clear()(dispatch, getState);
    users.clear()(dispatch, getState);
    global.clear()(dispatch, getState);
    integrationDefinitions.clear()(dispatch, getState);
    privateMetadata.clear()(dispatch, getState);
    termsAndConditions.clear()(dispatch, getState);
    revenueShares.clear()(dispatch, getState);
    jobs.clear()(dispatch, getState);
    wfs.clear()(dispatch, getState);
    // then user is now a guest
    access.set({ isLoggedIn: false, isGuest: true })(dispatch, getState);
  };
}

export function updateProfile(data) {
  return (dispatch, getState) => profile.update(data)(dispatch, getState);
}

export function updatePreferences(data) {
  return (dispatch, getState) => preferences.update(getState().user.access.data.uid, { ...getState().user.preferences.data.item, ...data })(dispatch, getState);
}

export function confirmEmail(data) {
  return (dispatch, getState) => access.confirmEmail(data.token, data.uid, data.password)(dispatch, getState)
    .then(() => login({ email: data.email, password: data.password })(dispatch, getState))
    .then(() => {
      new Promise((resolve) => setTimeout(resolve, 2000))
        .then(() => updateProfile({ firstName: data.firstName, lastName: data.lastName })(dispatch, getState));
    })
    .then(() => {
      router.navigateTo('dashboard', {})(dispatch, getState);
    });
}

export function resetPassword(data) {
  return (dispatch, getState) => console.log('hit') || access.resetPassword(data.uid, data.token, data.password)(dispatch, getState)
    .then(() => router.navigateTo('dashboard', {})(dispatch, getState));
}

export function clearAccessErrors() {
  return (dispatch, getState) => access.clearErrors()(dispatch, getState);
}

export function resetPasswordRequest(email) {
  return (dispatch, getState) => access.resetPasswordRequest(email)(dispatch, getState);
}

export function clearProfileErrors() {
  return (dispatch, getState) => {
    profile.clearErrors()(dispatch, getState);
  };
}

export function enrollTwoFactorAuth(data) {
  return (dispatch, getState) => {
    twoFactorAuth.enroll(data)(dispatch, getState);
  };
}

export function verifyTwoFactorAuthToken(data) {
  return (dispatch, getState) => {
    twoFactorAuth.verify(getState().user.access.data.uid, data)(dispatch, getState).then(() => {
      sync()(dispatch, getState);
    });
  };
}

export function fetchTwoFactorAuthQrCode() {
  return () => TwoFactorAuthAPI.fetchQrCode();
}

export function requestSMS() {
  return () => TwoFactorAuthAPI.requestSMS();
}

export function cancelSetup() {
  return () => TwoFactorAuthAPI.cancelSetup();
}

export function removeTwoFactorAuth(data) {
  return (dispatch, getState) => twoFactorAuth.remove(data)(dispatch, getState);
}

export function clearTwoFactorAuthErrors() {
  return (dispatch) => twoFactorAuth.clearErrors()(dispatch);
}

export function clearErrors(ns) {
  return (dispatch) => reducers[ns].clearErrors()(dispatch);
}

export function acceptTermsAndConditions(data) {
  // eslint-disable-next-line max-len
  return (dispatch, getState) => userTermsAndConditions.accept(getState().user.access.data.uid, data)(dispatch, getState);
}
