import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, removeListeners, watchSlice } from 'store/_utilities/firebaseHelpers';
import GlobalVendorAPI from 'api/globalVendors';

const namespace = 'GLOBALCREDENTIALSCHEMAS';
export const actionTypes = createActionTypes(namespace);

// Reducer //
const DEFAULT_DATA_STATE = {
  paths: {},
  items: {},
};
const DEFAULT_COLLECTION_STATE = {
  _ids: {},
  names: {},
};

export function _moduleReducers(state = DEFAULT_DATA_STATE, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...DEFAULT_DATA_STATE };

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

export function _collectionReducers(state = DEFAULT_COLLECTION_STATE, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...DEFAULT_COLLECTION_STATE };
      case actionTypes.fetchSuccess:
        return { ...state, ...action.collections };
      default:
      return state;
  }
}

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
  collections: _collectionReducers,
});

export default reducer;

// action creators
export function sync() {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchCollection('state/globalVendors/credentialSchemas', (items, paths) => {
      const formattedItems = _formatItems(items);

      const collections = Object.keys(formattedItems).reduce((acc, id) => {
        const item = formattedItems[id];
        acc._ids[item._id] = acc._ids[item._id] ? [...acc._ids[item._id], id] : [id];
        acc.names[item.name] = acc.names[item.name] ? [...acc.names[item.name], id] : [id];
        return acc;
      }, DEFAULT_COLLECTION_STATE);

      dispatch({ type: actionTypes.fetchSuccess, items: formattedItems, paths, collections });
    });
  };
}

export function syncRelevantData(credentialSchemaId) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    const inStore = getState().global.credentialSchemas.collections._ids[credentialSchemaId];
    if (!credentialSchemaId || inStore) return dispatch({ type: actionTypes.fetchSuccess });

    return watchSlice('state/globalVendors/credentialSchemas', { parameter: '_id', parameterValue: credentialSchemaId }, (items, path) => { 
      const collections = Object.keys(items).reduce((acc, id) => {
        const item = items[id];
        acc._ids[item._id] = acc._ids[item._id] ? [...acc._ids[item._id], id] : [id];
        acc.names[item.name] = acc.names[item.name] ? [...acc.names[item.name], id] : [id];
        return acc;
      }, DEFAULT_COLLECTION_STATE);
      dispatch({ type: actionTypes.fetchSuccess, items, paths: path, collections });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().global.credentialSchemas.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function create(data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return GlobalVendorAPI.createCredentialSchema(data)
    .then(() => {
      dispatch({ type: actionTypes.createSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function update(id, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return GlobalVendorAPI.updateCredentialSchema(id, data)
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

// private helpers
const _formatItems = (items) => {
  return items;
};
