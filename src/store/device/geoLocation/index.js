import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';
import { GeolocationAPI } from 'api/device';

const namespace = 'DEVICE_GEOLOCATION';
export const actionTypes = createActionTypes(namespace);

const DEFAULT_STATE = {
  location: { latitude: null, longitude: null },
  timestamp: null,
};

export function _moduleReducers(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...DEFAULT_STATE };
    case actionTypes.initializeSuccess:
      return { ...state, ...action.data };
    case actionTypes.fetchSuccess:
      return { ...state, ...action.data };
    case actionTypes.fetchError:
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

export function init() {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.initializeStart });
    try {
      dispatch({ type: actionTypes.initializeSuccess, data: { location: DEFAULT_STATE.location, timestamp: DEFAULT_STATE.timestamp } });
    } catch (err) {
      dispatch({ type: actionTypes.initializeError, data: { location: DEFAULT_STATE.location, timestamp: DEFAULT_STATE.timestamp } , error: err.message });
    }
  };
}

export function getCurrentLocation() {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    try {
      const geolocationAPI = await GeolocationAPI();
      const location = await geolocationAPI.getCurrentLocation();
      return dispatch({ type: actionTypes.fetchSuccess, data: { location: { latitude: location.coords.latitude, longitude: location.coords.longitude }, timestamp: location.timestamp} });
    } catch (err) {
      dispatch({ type: actionTypes.fetchError, data: { location: { latitude: null, longitude: null }, timestamp: null }, error: err.message });
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
