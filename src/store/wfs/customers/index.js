/* eslint no-undef:0 */
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';

import query from './query';
import * as device from '../../device';

const namespace = 'WFS_CUSTOMERS';
export const actionTypes = createActionTypes(namespace);

const DEFAULT_DATA_STATE = {};
const DEFAULT_COLLECTION_STATE = {
  customerNames: {},
  tailNumbers: {},
  siteNumbers: {},
};

export function _moduleReducers(state = DEFAULT_DATA_STATE, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...DEFAULT_DATA_STATE };
    case actionTypes.fetchSuccess:
      return { ...state, ...action.data };
    case actionTypes.updateSuccess:
      return action.data;
    default:
      return state;
  }
}

export function _collectionReducers(state = DEFAULT_COLLECTION_STATE, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...DEFAULT_COLLECTION_STATE };
    case actionTypes.fetchSuccess:
      return { ...state, ...action.collections };
    case actionTypes.updateSuccess:
      return action.collections;
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
      const customerData = (await device.getCache(`customers.${getState().wfs.oAuth.data.decoded['https://wfscorp.com/custom-claims'].username}`, { query, skipCache: true })(dispatch, getState)).flat(1);
      const data = customerData.reduce((acc, curr) => {

        curr.sites = curr.sites.reduce((acc2, curr2) => {
          acc2[curr2.siteNumber] = curr2;
          return acc2;
        }, {});

        curr.tails = curr.tails.edges.reduce((acc2, curr2) => {
          curr2.node._id = curr2.node.tailNumber;
          acc2[curr2.node.tailNumber] = curr2.node;
          return acc2;
        }, {});

        acc[curr.customerNumber] = curr;
        return acc;
      }, {});

      const collections = Object.values(data).reduce((acc, curr) => {
        acc.customerNames[curr.customerName] = curr.customerNumber;
        acc.tailNumbers[curr.customerNumber] = Object.keys(curr.tails);
        acc.siteNumbers[curr.customerNumber] = Object.keys(curr.sites);
        return acc;
      }, DEFAULT_COLLECTION_STATE);

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

export function updateSync(skipCache, setContext, eventDetail, closeValue, closeModal) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });
    try {
      const customerData = (await device.getCache(`customers.${getState().wfs.oAuth.data.decoded['https://wfscorp.com/custom-claims'].username}`, { query, skipCache: true })(dispatch, getState)).flat(1);
      const data = customerData.reduce((acc, curr) => {

        curr.sites = curr.sites.reduce((acc2, curr2) => {
          acc2[curr2.siteNumber] = curr2;
          return acc2;
        }, {});

        curr.tails = curr.tails.edges.reduce((acc2, curr2) => {
          curr2.node._id = curr2.node.tailNumber;
          acc2[curr2.node.tailNumber] = curr2.node;
          return acc2;
        }, {});

        acc[curr.customerNumber] = curr;
        return acc;
      }, {});

      const collections = Object.values(data).reduce((acc, curr) => {
        acc.customerNames[curr.customerName] = curr.customerNumber;
        acc.tailNumbers[curr.customerNumber] = Object.keys(curr.tails);
        acc.siteNumbers[curr.customerNumber] = Object.keys(curr.sites);
        return acc;
      }, DEFAULT_COLLECTION_STATE);

      const currentContext = getState().wfs.data.context;
      const contextSet = !!currentContext.customerNumber && !!currentContext.tailNumber;
      const customerAvailable = contextSet && !!data[currentContext.customerNumber];
      const tailAvailable = contextSet && customerAvailable && !!data[currentContext.customerNumber].tails[currentContext.tailNumber];
      const contextNotPresent = !customerAvailable || !tailAvailable;
      if (contextSet && contextNotPresent) {
        await device.showToast({ message: 'The tail and/or flight department selected are no longer available. Please select a new tail.', color: 'primary' })(dispatch, getState);
        setContext()(dispatch, getState);
        if (closeValue && closeModal && !data[closeValue]) closeModal();
      } else {
        if (closeValue && !data[closeValue]) {
          await device.showToast({ message: 'The flight department you were selecting from is no longer available.', color: 'primary' })(dispatch, getState);
          if (closeModal) closeModal();
        }
      }
      if (eventDetail) eventDetail.complete();
      return dispatch({ type: actionTypes.updateSuccess, data, collections });
    } catch (err) {
      if (getState().wfs.preferences.data.errorTracing) {
      } else {
        // device.showToast({ message: 'Oops! We just encountered an error, Support has been notified', color: 'danger', duration: 5000 })(dispatch);
      }
      if (eventDetail) eventDetail.complete();
      dispatch({ type: actionTypes.updateError, error: err.message });
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
