/* eslint no-undef:0 */
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';
import md5 from 'md5';
import { collectionHelper } from '../_utils';
import query from './query';
import * as device from '../../device';

const namespace = 'WFS_CARDS';
export const actionTypes = createActionTypes(namespace);

const DEFAULT_DATA_STATE = {};
const DEFAULT_COLLECTION_STATE = {
  tails: {},
  customerNumbers: {},
  customerNames: {},
};

export function _moduleReducers(state = DEFAULT_DATA_STATE, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...DEFAULT_DATA_STATE };
    case actionTypes.initializeSuccess:
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
    case actionTypes.initializeSuccess:
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
    dispatch({ type: actionTypes.initializeStart });
    try {
      const { customerNumber, tailNumber } = context;
      const params = { customerNumber: parseInt(customerNumber, 10), tailNumber };

      // indexByItemId put a custom _id onto the cached object in-case the object returned from the API does not have a unique identifier
      const indexByItemId = (item) => md5(`${tailNumber}.${item.cardNumber}.${item.expirationDate}`);

      const cards = await device.getCache(`cards.${customerNumber}.${tailNumber}`, {
        query,
        params,
        skipCache,
        indexByItemId,
      })(dispatch, getState);

      const data = cards.reduce((acc, curr) => {
        acc[curr._id] = curr;
        return acc;
      }, {});

      const collections = cards.reduce((acc, curr) => {
        acc.tails[context.tailNumber] = cards.map((card) => card._id);
        acc.customerNumbers[context.customerNumber] = cards.map((card) => card._id);
        acc.customerNames[curr.customerName] = cards.map((card) => card._id);
        return acc;
      }, { tails: {}, customerNumbers: {}, customerNames: {} });

      return dispatch({ type: actionTypes.initializeSuccess, data, collections });
    } catch (err) {
      if (getState().wfs.preferences.data.errorTracing) {
        // device.showToast({ message: `Cards: ${err.message} ${err.stack}`, color: 'danger', duration: 5000 })(dispatch);
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

