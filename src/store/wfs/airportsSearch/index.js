/* eslint no-undef:0 */
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';
import query from './query';
// import utils from '../_utils';
import * as device from '../../device';

const namespace = 'WFS_AIRPORTS_SEARCH';
export const actionTypes = createActionTypes(namespace);

const DEFAULT_DATA_STATE = {};

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

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
});

export default reducer;

export function search(searchString) {
  return async(dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    try {
      const indexByItemId = item => item.icao;

      const params = { search: searchString };
      const airports = await device.getCache('airportsByGeo', { query, params, skipCache: true, indexByItemId })(dispatch, getState);

      const data = airports.reduce((acc, curr) => {
        acc[curr._id] = curr;
        return acc;
      }, {});

      return dispatch({ type: actionTypes.fetchSuccess, data });
    } catch (err) {
      // device.showToast({ message: `Airports Search: ${err.message} ${err.stack}`, color: 'danger', duration: 5000 })(dispatch);
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
