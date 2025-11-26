import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import sftpAPI from '../../../api/sftp';

const namespace = 'SFTP';

export const actionTypes = createActionTypes(namespace);

export const defaultState = {
  paths: {},
  items: {},
};

export function _moduleReducers(state = defaultState, action) { // eslint-disable-line
  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    case actionTypes.fetchSuccess:
      return {
        ...state,
        items: action.items,
      };
    case actionTypes.createSuccess:
      return {
        ...state,
        items: action.items,
      };
    case actionTypes.updateSuccess:
      return {
        ...state,
        items: action.items,
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

export function createSftpUser(sftpUser) {
  return (dispatch, getState) => {
    const { ipWhitelist, ...rest } = sftpUser;
    const whitelist = (ipWhitelist && ipWhitelist.replace(/\s+/g, '').split(',')) || [];

    const payload = {
      organizationId: getState().organization.data.id,
      accountId: getState().account.data.id,
      whitelist,
      ...rest,
    };

    dispatch({ type: actionTypes.createStart });

    return sftpAPI.createSftpUser({ ...payload })
      .then(({ data }) => {
        dispatch({ type: actionTypes.createSuccess, items: data });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.createError, error: error.response.data.error });
      });
  };
}
export function updateSftpUser(sftpUser) {
  return (dispatch, getState) => {
    const {
      ipWhitelist, password, id, username, active,
    } = sftpUser;
    const whitelist = (ipWhitelist && ipWhitelist.replace(/\s+/g, '').split(',')) || [];

    const payload = {
      organizationId: getState().organization.data.id,
      accountId: getState().account.data.id,
      id,
      username,
      active,
      whitelist,
      ...(password && { password }),
    };

    dispatch({ type: actionTypes.updateStart });
    return sftpAPI.updateSftpUser({ ...payload })
      .then(({ data }) => {
        dispatch({ type: actionTypes.updateSuccess, items: data });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.updateError, error: error.response.data.error });
      });
  };
}

export function getSftpUser() {
  return (dispatch, getState) => {
    const accountId = getState().account.data.id;
    dispatch({ type: actionTypes.fetchStart });
    return sftpAPI.getSftpUser(accountId)
      .then(({ data }) => {
        dispatch({ type: actionTypes.fetchSuccess, items: data });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.fetchError, error: error.response.data.error });
      });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

export function clear() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clear });
  };
}
