/* eslint no-undef:0 */
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';
import md5 from 'md5';
import * as user from 'store/user';
import * as router from 'store/router';
import * as biometrics from 'store/device/biometrics';
import * as device from '../../device';

const namespace = 'WFS_PREFERENCES';
export const actionTypes = createActionTypes(namespace);

const DEFAULT_DATA_STATE = {
  useBiometrics: false,
  biometricsTimeout: 0,
  favoriteContext: {},
  previousContexts: [],
  errorTracing: false,
};

export function _moduleReducers(state = DEFAULT_DATA_STATE, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...DEFAULT_DATA_STATE };
    case actionTypes.fetchSuccess:
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
    dispatch({ type: actionTypes.fetchStart });
    try {
      const customers = getState().wfs.customers.data;
      const tailsCollection = getState().wfs.customers.collections.tailNumbers;

      const userId = md5(getState().wfs.oAuth.data.decoded['https://wfscorp.com/custom-claims'].username);
      if (!userId) throw new Error('could not parse username from token custom claims');

      const [data = {}] = await device.getCache(`preferences.${userId}`)(dispatch, getState) || [];

      // Filter out contexts that are no longer available to the user.
      const filteredData = {
        ...data,
        favoriteContext:
          data.favoriteContext.customerNumber &&
          data.favoriteContext.tailNumber &&
          (!Object.keys(customers).find(customer => customer === (data.favoriteContext).customerNumber.toString()) ||
          !tailsCollection[(data.favoriteContext || {}).customerNumber.toString()].find(tail => tail === (data.favoriteContext || {}).tailNumber)) ?
          {} : data.favoriteContext,
        previousContexts: (data.previousContexts || []).filter((previousContext) => {
          return previousContext.customerNumber &&
            previousContext.tailNumber &&
            Object.keys(customers).includes(previousContext.customerNumber.toString()) &&
            tailsCollection[previousContext.customerNumber].includes(previousContext.tailNumber);
        }),
      };
      if (!filteredData.useBiometrics) {
        await biometrics.setAuthed(true)(dispatch);
      }

      dispatch({ type: actionTypes.fetchSuccess, data: filteredData });
      return { ...DEFAULT_DATA_STATE, ...filteredData };
    } catch (err) {
      if (getState().wfs.preferences.data.errorTracing) {
        // device.showToast({ message: `Preferences: ${err.message} ${err.stack}`, color: 'danger', duration: 5000 })(dispatch);
      } else {
        // device.showToast({ message: 'Oops! We just encountered an error, Support has been notified', color: 'danger', duration: 5000 })(dispatch);
      }
      dispatch({ type: actionTypes.fetchError, error: err.message });
    }
  };
}

export function set(data) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });
    try {
      const userId = md5(getState().wfs.oAuth.data.decoded['https://wfscorp.com/custom-claims'].username);
      await device.setCache(`preferences.${userId}`, data, { expires: false })(dispatch, getState);
      dispatch({ type: actionTypes.updateSuccess, data });
    } catch (err) {
      if (getState().wfs.preferences.data.errorTracing) {
        // device.showToast(err)(dispatch, getState);
      } else {
        // device.showToast({ message: 'Oops! We just encountered an error, Support has been notified', color: 'danger', duration: 5000 })(dispatch);
      }
      dispatch({ type: actionTypes.updateError, error: err.message });
    }
  };
}

export function remove(data) {
  return async (dispatch, getState) => {
    const preferences = getState().wfs.preferences.data;
    await device.removeCache('preferences', { ...preferences, ...data }, { expires: false })(dispatch, getState);
    dispatch({ type: actionTypes.updateStart });
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
