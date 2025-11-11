import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, removeListeners, watchValue } from 'store/_utilities/firebaseHelpers';
import GlobalVendorAPI from 'api/globalVendors';

const namespace = 'GLOBALVENDORTAGS';
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
        items: { ...state.items, ...action.data },
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
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    watchCollection('state/globalVendors/tags', (data, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, data, paths });
    });
  };
}

export function syncRelevantData(tagIds) {
  return (dispatch, getState) => {
    if (!tagIds) return dispatch({ type: actionTypes.fetchSuccess });
    const items = {};
    return Promise.all(tagIds.map((tagId, i) => {
      dispatch({ type: actionTypes.fetchStart });

      const inStore = getState().global.tags.data.items[tagId];
      if (inStore) return dispatch({ type: actionTypes.fetchSuccess });

      return watchValue(`state/globalVendors/tags/${tagId}`, (item, path) => {
      items[item._id] = item;
      if (i === tagIds.length - 1) return dispatch({ type: actionTypes.fetchSuccess, data: { ...items }, paths: path });
      });
    }));
  };
}

export function create(data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return GlobalVendorAPI.createTag(_adaptToAPI(data))
    .then((response) => {
      dispatch({ type: actionTypes.createSuccess });
      return response;
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function update(id, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return GlobalVendorAPI.updateTag(id, _adaptToAPI(data))
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
    removeListeners(getState().global.tags.data.paths);
    return dispatch({ type: actionTypes.clear });
  };
}

export function clearErrors() {
  return (dispatch) => {
    return dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

// private helpers

function _adaptToAPI(data) {
  const tag = {
    name: data.name,
    description: data.description,
    active: data.active,
    aliases: data.aliases,
  };
  return tag;
}
