import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection } from 'store/_utilities/firebaseHelpers';
import MagicLinksAPI from 'api/magicLinks';

const namespace = 'MAGIC_LINKS';
export const actionTypes = createActionTypes(namespace);

// Reducer //
export const defaultState = {
  item: {},
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    case actionTypes.submitSuccess:
    case actionTypes.fetchSuccess:
      return {
        ...state,
        item: { ...action.data },
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
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchCollection('integrationDefinitions', (data, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, data, paths });
    });
  };
}

export function fetchMagicLinkData(token) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return MagicLinksAPI.fetchMagicLinkData(token)
      .then(({ data }) => {
        dispatch({ type: actionTypes.fetchSuccess, data });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.fetchError, error: error.response.data.error });
      });
  };
}

export function patchMagicLinkData(token, payload) {
  return (dispatch) => {
    dispatch({ type: actionTypes.submitStart });
    return MagicLinksAPI.patchMagicLinkData(token, payload).then(() => {
      return MagicLinksAPI.fetchMagicLinkData(token);
    }).then(({ data }) => {
      dispatch({ type: actionTypes.submitSuccess, data });
    }).catch((error) => {
      dispatch({ type: actionTypes.submitError, error: error.response.data.error });
    });
  };
}
