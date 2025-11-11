/* eslint no-undef:0 */
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';
import * as router from 'store/router';
import query from './query';
import * as device from '../../device';

const namespace = 'WFS_PDFS';
export const actionTypes = createActionTypes(namespace);

const DEFAULT_DATA_STATE = {};

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

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
});

export default reducer;

export function getDocument(resourceId) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    try {
      const { customerNumber, tailNumber } = getState().wfs.data.context;
      const indexByItemId = () => {
        return resourceId;
      };

      const params = { resourceId };
      let pdf = await device.getCache(`pdfs.${customerNumber}.${tailNumber}.${resourceId}`, { query, params, indexByItemId })(dispatch, getState);
      pdf = pdf[0];
      return dispatch({ type: actionTypes.fetchSuccess, data: { [resourceId]: pdf } });
    } catch (err) {
      if (getState().wfs.preferences.data.errorTracing) {
        // device.showToast({ message: `pdfs: ${err.message} ${err.stack}`, color: 'danger', duration: 5000 })(dispatch);
      } else {
        // device.showToast({ message: 'Oops! We just encountered an error, Support has been notified', color: 'danger', duration: 5000 })(dispatch);
      }
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
