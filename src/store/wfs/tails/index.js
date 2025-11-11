/* eslint no-undef:0 */
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';
import md5 from 'md5';

import { collectionHelper } from '../_utils';
import query from './query';
import * as device from '../../device';

const namespace = 'WFS_TAILS';
export const actionTypes = createActionTypes(namespace);

const DEFAULT_DATA_STATE = {};
const DEFAULT_COLLECTION_STATE = {
  customerIds: {},
};

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
  status: createStatusReducer(namespace),
  data: _moduleReducers,
  collections: _collectionReducers,
});

export default reducer;

export function sync(skipCache) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    try {
      // indexByItemId put a custom _id onto the cached object in-case the object returned from the API does not have a unique identifier
      const indexByItemId = (item) => item.tailNumber;
      const customerIds = Object.keys(getState().wfs.customers.data);
      const userId = md5(getState().wfs.oAuth.data.decoded['https://wfscorp.com/custom-claims'].username);

      const customerTails = await Promise.all(customerIds.map((customerId) => {
        const params = { customerNumber: parseInt(customerId, 10) };
        return device.getCache(`tails.${userId}.${customerId}`, {
          query, params, skipCache, indexByItemId, 
        })(dispatch, getState);
      }));

      const data = customerTails.reduce((acc, curr, index) => {
        curr.forEach((tail) => acc[tail._id] = tail);
        return acc;
      }, {});

      const collections = customerTails.reduce((acc, curr, index, array) => {
        acc.customerIds[customerIds[index]] = curr.map((tail) => tail._id);
        return acc;
      }, { customerIds: {} });

      return dispatch({ type: actionTypes.fetchSuccess, data, collections });
    } catch (err) {
      if (getState().wfs.preferences.data.errorTracing) {
        // device.showToast({ message: `Tails: ${err.message} ${err.stack}`, color: 'danger', duration: 5000 })(dispatch);
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
