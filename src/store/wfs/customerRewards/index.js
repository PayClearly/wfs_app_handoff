/* eslint no-undef:0 */
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';
import * as device from 'store/device';
import * as user from 'store/user';
import * as router from 'store/router';

import { collectionHelper } from '../_utils';
import query from './query';

const namespace = 'WFS_CUSTOMER_REWARDS';
export const actionTypes = createActionTypes(namespace);

const DEFAULT_DATA_STATE = {};
const DEFAULT_COLLECTION_STATE = {
  members: {},
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

export function sync(context, skipCache) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    try {
      const { customerNumber } = context;
      const params = { customerNumber: parseInt(customerNumber, 10) };

      const customerRewards = await device.getCache(`customerRewards.${customerNumber}`, { query, params, skipCache })(dispatch, getState);

      const collections = {
        members: {
          [customerNumber]: customerRewards.members.map((member) => member.memberNumber),
        },
      };

      return dispatch({ type: actionTypes.fetchSuccess, data: { [customerNumber]: customerRewards }, collections });
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
