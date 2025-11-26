/* eslint no-undef:0 */
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';
import * as user from 'store/user';
import * as router from 'store/router';
import query from './query';
import { collectionHelper } from '../_utils';
import * as device from '../../device';

const namespace = 'WFS_FACILITIES';
export const actionTypes = createActionTypes(namespace);

const DEFAULT_DATA_STATE = {};
const DEFAULT_COLLECTION_STATE = { icaos: {}, iatas: {} };

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

export function _collectionReducers(state = DEFAULT_COLLECTION_STATE, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...DEFAULT_COLLECTION_STATE };
    case actionTypes.fetchSuccess:
      return collectionHelper(state, action.collections);
    default:
      return state;
  }
}

export const reducer = combineReducers({
  collections: _collectionReducers,
  status: createStatusReducer(namespace),
  data: _moduleReducers,
});

export default reducer;

export function sync(context, skipCache) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    try {
      const params = { icaos: Object.keys(getState().wfs.trips.collections.icaos) };

      const indexByItemId = (item) => item.id;

      const facilities = await device.getCache('facilities', {
 query, params, skipCache, indexByItemId, 
})(dispatch, getState);

      const data = facilities.reduce((acc, curr) => {
        acc[curr_.id] = curr;
        return acc;
      }, {});

      const collections = facilities.reduce((acc, curr) => {
        acc.icaos[curr.icaoCode] = curr._id;
        acc.iatas[curr.iataCode] = curr._id;
        return acc;
      }, { icaos: {}, iatas: {} });

      return dispatch({ type: actionTypes.fetchSuccess, data, collections });
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
