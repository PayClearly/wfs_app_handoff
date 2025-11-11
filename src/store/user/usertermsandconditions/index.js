import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';

import UserAPI from 'api/user';

const namespace = 'USER_TERMS_AND_CONDITIONS';
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

export function accept(uid, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return UserAPI.acceptTermsAndConditions(uid, data)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}
