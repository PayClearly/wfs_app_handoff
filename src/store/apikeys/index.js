import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValue, removeListeners } from 'store/_utilities/firebaseHelpers';
import ApiKeysAPI from 'api/apiKey';

const namespace = 'APIKEY';
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
        items: { ...state.items, ...action.items },
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
export function sync() {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchValue('state/apiKeys', (items, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, items, paths });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().organizations.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function update(organizationId, accountId, apiKeyId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return ApiKeysAPI.update(organizationId, accountId, apiKeyId, data)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function create(organizationId, accountId, payload) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return ApiKeysAPI.create(organizationId, accountId, payload)
    .then(({ data }) => {
      dispatch({ type: actionTypes.createSuccess });
      return data.id;
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}
