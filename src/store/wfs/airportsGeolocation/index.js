/* eslint no-undef:0 */
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';
import query from './query';
import * as device from '../../device';

const namespace = 'WFS_AIRPORTS_GEOLOCATION';
export const actionTypes = createActionTypes(namespace);

const DEFAULT_DATA_STATE = {};

const DEFAULT_COLLECTION_STATE = {
  nearest: {},
};

export function _moduleReducers(state = DEFAULT_DATA_STATE, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...DEFAULT_DATA_STATE };
    case actionTypes.initializeSuccess:
    case actionTypes.fetchSuccess:
      return action.data;
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

export function sync(searchRadius = 10) {
  return async(dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    try {
      const geoLocation = getState().device.geolocation.data;

      const indexByItemId = item => item.icao;

      const params = { latitude: geoLocation.location.latitude, longitude: geoLocation.location.longitude, radius: searchRadius };
      const airports = await device.getCache('airportsByGeo', { query, params, skipCache: true, indexByItemId })(dispatch, getState);

      const data = airports.reduce((acc, curr) => {
        acc[curr._id] = curr;
        return acc;
      }, {});
      const tempCollections = airports.reduce((acc, curr) => {
        const distanceAway = _haversineFormula(params, curr);
        if (acc[distanceAway]) {
          acc.nearest[distanceAway + 0.1] = curr.icao;
        } else {
          acc.nearest[distanceAway] = curr.icao;
        }
        return acc;
      }, { nearest: {} });
      const collections = Object.keys(tempCollections.nearest).sort((a, b) => parseFloat(a) - parseFloat(b)).reduce((acc, curr) => {
        acc.nearest[curr] = tempCollections.nearest[curr];
        return acc;
      }, { nearest: {} });
      return dispatch({ type: actionTypes.fetchSuccess, data, collections });
    } catch (err) {
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

// Internal Helper Functions

function _haversineFormula(currentLocation, airportLocation) {
  const earthRadius = 6371e3;
  const lat1 = _toRadians(currentLocation.latitude);
  const lat2 = _toRadians(airportLocation.latitudeDec);
  const deltaLat = _toRadians(currentLocation.latitude - airportLocation.latitudeDec);
  const deltaLong = _toRadians(currentLocation.longitude - airportLocation.longitudeDec);

  const a = ((Math.sin(deltaLat / 2)) ** 2) + Math.cos(lat1) * Math.cos(lat2) * ((Math.sin(deltaLong / 2)) ** 2);
  const c = 2 * Math.asin(Math.min(1, Math.sqrt(a)));

  const distance = earthRadius * c;
  return distance;
}

function _toRadians(x) { return x * Math.PI / 180; }
