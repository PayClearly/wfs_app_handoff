import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';

import TwoFactorAuthAPI from 'api/twofactorauth';

const namespace = 'TWOFACTORAUTH';
export const actionTypes = createActionTypes(namespace);

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
});

export default reducer;

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

export function verify(uid, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return TwoFactorAuthAPI.verify(uid, data)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function enroll(uid, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return TwoFactorAuthAPI.create(uid, data)
    .then(() => {
      dispatch({ type: actionTypes.createSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function remove(data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.deleteStart });
    return TwoFactorAuthAPI.removeTwoFactorAuth(data)
    .then(() => {
      dispatch({ type: actionTypes.deleteSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.deleteError, error: error.response.data.error });
    });
  };
}
