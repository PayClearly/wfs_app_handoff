import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValue, removeListeners } from 'store/_utilities/firebaseHelpers';
import PermissionsAPI from 'api/permissions';

const namespace = 'ORGANIZATIONROLES';
export const actionTypes = createActionTypes(namespace);

// Reducer //
export const defaultState = {
  paths: {},
  items: {},
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    case actionTypes.fetchSuccess:
      return {
        ...state,
        items: { ...action.data },
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
export function sync(id) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchValue(`state/permissions/grantedTo/organizationLevel/${id}`, (data, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, data, paths });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().organization.roles.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function updateRoles(level, userId, role) {
  return (dispatch, getState) => {
    const data = {};
    data[userId] = {};
    data[userId][role] = true;
    if (role === 'none') {
      data[userId] = null;
    }
    dispatch({ type: actionTypes.updateStart });
    const { account, organization } = getState();
    return PermissionsAPI.updateRoles(level, organization.data.id, account.data.id, data)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}
