/* eslint no-undef:0 */
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';
import * as user from 'store/user';
import * as router from 'store/router';
import query from './query';
import * as device from '../../device';

const namespace = 'WFS_AIRPORTS';
export const actionTypes = createActionTypes(namespace);

const DEFAULT_DATA_STATE = {};

export function _moduleReducers(state = DEFAULT_DATA_STATE, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...DEFAULT_DATA_STATE };
    case actionTypes.fetchSuccess:
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

export function sync(context, skipCache) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    try {
      // indexByItemId put a custom _id onto the cached object in-case the object returned from the API does not have a unique identifier
      const indexByItemId = item => item.icao;

      const params = { icaos: Object.keys(getState().wfs.trips.collections.icaos) };
      const airports = await device.getCache('airports', { query, params, skipCache, indexByItemId })(dispatch, getState);

      const data = airports.reduce((acc, curr) => {
        acc[curr._id] = curr;
        return acc;
      }, {});

      return dispatch({ type: actionTypes.fetchSuccess, data });
    } catch (err) {
      if (getState().wfs.preferences.data.errorTracing) {
      } else {
        // device.showToast({ message: 'Oops! We just encountered an error, Support has been notified', color: 'danger', duration: 5000 })(dispatch);
      }
      dispatch({ type: actionTypes.fetchError, error: err.message });
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
