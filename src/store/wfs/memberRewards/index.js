/* eslint no-undef:0 */
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';
import md5 from 'md5';

import * as device from 'store/device';
import { collectionHelper } from '../_utils';
import query from './query';

const namespace = 'WFS_MEMBER_REWARDS';
export const actionTypes = createActionTypes(namespace);

const DEFAULT_DATA_STATE = {};
const DEFAULT_COLLECTION_STATE = {
  memberNumberIds: {},
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

export function sync(context, skipCache = true) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    try {
      const indexByItemId = (item) => md5(item.resourceId);
      const userId = md5(getState().wfs.oAuth.data.decoded['https://wfscorp.com/custom-claims'].username);
      const customerRewards = getState().wfs.oAuth.data.decoded['https://wfscorp.com/custom-claims'].customers.find((customer) => customer.number === context.customerNumber) || {};
      const rewardsMemberNumber = customerRewards.rewardsMemberNumber || [];
      const customerNumber = customerRewards.number;

      const memberRewards = await Promise.all(rewardsMemberNumber.map((memberNumber) => {
        const params = { memberNumber: parseInt(memberNumber, 10) };
        return device.getCache(`memberRewards.${userId}.${memberNumber}`, {
          query,
          params,
          skipCache,
          indexByItemId,
        })(dispatch, getState);
      }));

      const data = memberRewards.reduce((acc, curr, index) => {
        curr.forEach((memberReward) => acc[memberReward._id] = memberReward);
        return acc;
      }, {});

      const collections = memberRewards.reduce((acc, curr, index) => {
        acc.memberNumberIds[rewardsMemberNumber[index]] = curr.map((memberReward) => memberReward._id);
        acc.customerIds[customerNumber] = curr.map((memberReward) => memberReward._id);
        return acc;
      }, { memberNumberIds: {}, customerIds: {} });

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
