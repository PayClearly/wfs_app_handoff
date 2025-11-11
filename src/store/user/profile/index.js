import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValue, removeListeners } from 'store/_utilities/firebaseHelpers';

import UserAPI from 'api/user';

const namespace = 'USERPROFILE';
export const actionTypes = createActionTypes(namespace);

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

// action creators
export function sync(userId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchValue(`state/users/${userId}`, (data, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, data, paths });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().user.profile.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

export function update(profileData) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });
    const uid = getState().user.access.data.uid;
    return UserAPI.update(uid, profileData)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess, data: {}, paths: {} });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}
