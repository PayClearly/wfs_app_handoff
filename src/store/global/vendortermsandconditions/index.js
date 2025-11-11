import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import GlobalVendorAPI from 'api/globalVendors';

const namespace = 'VENDOR_TERMS_AND_CONDITIONS';
export const actionTypes = createActionTypes(namespace);

// Reducer //
export const defaultState = {
  paths: {},
  item: {},
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    case actionTypes.fetchSuccess:
      return {
        ...state,
        item: { ...action.data },
        paths: { ...state.paths, ...action.paths },
      };

    default:
      return state;

  }
}

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
});

export default reducer;

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

export function accept(token) {
  return (dispatch) => {
    dispatch({ type: actionTypes.submitStart });
    return GlobalVendorAPI.acceptTermsAndConditions(token)
    .then(() => {
      dispatch({ type: actionTypes.submitSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.submitError, error: error.response.data.error });
    });
  };
}

export function fetch(timestamp) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return GlobalVendorAPI.fetchLatestTermsAndConditions(timestamp)
    .then(({ data }) => {
      dispatch({ type: actionTypes.fetchSuccess, data: { html: data } });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.fetchError, error: error.response.data.error });
    });
  };
}
