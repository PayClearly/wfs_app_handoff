import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { removeListeners } from 'store/_utilities/firebaseHelpers';
import USPSAPI from 'api/usps';

const namespace = 'USPS';
export const actionTypes = createActionTypes(namespace);

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
});

export default reducer;

// action creators

// export function clear() {
//   return (dispatch, getState) => {
//     removeListeners(getState().account.usps.data.paths);
//     dispatch({ type: actionTypes.clear });
//   };
// }

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

export function verify(mailingAddress) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return USPSAPI.verify(_adaptToAPI(mailingAddress))
    .then(() => {
      dispatch({ type: actionTypes.fetchSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.fetchError, error: error.response.data.error });
    });
  };
}

const _adaptToAPI = (mailingAddress = {}) => {
  return {
    address: [{
      address1: mailingAddress.streetAddress || '',
      city: mailingAddress.city || '',
      state: mailingAddress.state || '',
      zip5: mailingAddress.zipCode || '',
    }],
  };
};
