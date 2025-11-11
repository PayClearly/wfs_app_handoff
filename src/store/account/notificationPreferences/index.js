import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValue, removeListeners } from 'store/_utilities/firebaseHelpers';

import notifications from 'api/notifications';

const namespace = 'NOTIFICATIONS';
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

export function sync(organizationId, accountId) {
  return (dispatch, getState) => {
    const userId = getState().user.access.data.uid;
    dispatch({ type: actionTypes.fetchStart });
    return watchValue(`state/notificationPreferences/${userId}/${organizationId}/${accountId}`, (data, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, data, paths });
    });
  };
}

export function enroll(uid, data) {
  return (dispatch, getState) => {
    const organizationId = getState().organization.data.id;
    const accountId = getState().account.data.id;
    dispatch({ type: actionTypes.createStart });
    return notifications.add(uid, organizationId, accountId, data)
    .then(() => {
      dispatch({ type: actionTypes.createSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function update(uid, data) {
  return (dispatch, getState) => {
    const organizationId = getState().organization.data.id;
    const accountId = getState().account.data.id;
    dispatch({ type: actionTypes.updateStart });
    return notifications.update(uid, organizationId, accountId, data)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.notificationPreferences.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}
