/* eslint no-undef:0 */
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';
import query from './query';
import * as device from '../../device';

const namespace = 'WFS_TRIPS';

const DEFAULT_DATA_STATE = {};
const DEFAULT_COLLECTION_STATE = {
  icaos: [],
  recent: [],
  oldest: [],
};

export const actionTypes = createActionTypes(namespace);

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
      return { ...action.collections };
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
      const { customerNumber, tailNumber } = context || getState().wfs.data.context;
      const params = { customerNumber: parseInt(customerNumber, 10), tailNumber, first: 6 };
      const indexByItemId = (item) => item.tripNumber;

      const trips = await device.getCache(`trips.${customerNumber}.${tailNumber}`, {
        query,
        params,
        skipCache,
        indexByItemId,
      })(dispatch, getState);

      const data = trips.reduce((acc, curr) => {
        acc[curr._id] = curr;
        return acc;
      }, {});

      const collections = trips.reduce((acc, curr) => {
        acc.icaos.push(curr.tripDetail.origin.icao);
        acc.icaos.push(curr.tripDetail.destination.icao);
        return acc;
      }, { icaos: [] });
      // TODO Move sorting logic to the list component, don't need this overhead. Makes more confusing
      collections.recent = Object.values(trips)
        .sort((a, b) => {
          const aStart = a.tripDetail.startDate;
          const bStart = b.tripDetail.startDate;
          if (aStart > bStart) {
            return -1;
          }
          if (aStart < bStart) {
            return 1;
          }
          return 0;
        })
      .map((trip) => trip.tripNumber);
      collections.oldest = [...collections.recent];
      collections.oldest.reverse();

      return dispatch({ type: actionTypes.initializeSuccess, data, collections });
    } catch (err) {
      dispatch({ type: actionTypes.initializeError, error: err.message });
    }
  };
}

export function fetch(event) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    try {
      const { customerNumber, tailNumber } = getState().wfs.data.context;
      const _trips = getState().wfs.trips;
      const after = (Object.values(_trips.data)[Object.keys(_trips.data).length - 1] || {}).cursor;
      const params = {
        customerNumber: parseInt(customerNumber, 10),
        tailNumber,
        first: 6,
        after,
      };
      const indexByItemId = (item) => item.tripNumber;

      const trips = await device.getCache(`trips.${customerNumber}.${tailNumber}`, {
        query,
        params,
        indexByItemId,
      })(dispatch, getState);

      const data = trips.reduce((acc, curr) => {
        acc[curr._id] = curr;
        return acc;
      }, {});

      const collections = trips.reduce((acc, curr) => {
        if (!acc.icaos.includes(curr.tripDetail.origin.icao)) { acc.icaos.push(curr.tripDetail.origin.icao); }
        if (!acc.icaos.includes(curr.tripDetail.destination.icao)) { acc.icaos.push(curr.tripDetail.destination.icao); }
        if (!acc.recent.includes(curr.tripNumber)) { acc.recent.push(curr.tripNumber); }
        return acc;
      }, { icaos: _trips.collections.icaos, recent: _trips.collections.recent });

      collections.oldest = [...collections.recent];
      collections.oldest.reverse();

      if (event) {
        event.target.complete();
      }
      return dispatch({ type: actionTypes.fetchSuccess, data, collections });
    } catch (err) {
      if (event) { event.target.complete(); }
      return dispatch({ type: actionTypes.fetchError, error: err.message });
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
