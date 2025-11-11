import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, removeListeners } from 'store/_utilities/firebaseHelpers';
import ClientsAPI from 'api/clients';

import Utils from 'utils';

const namespace = 'CLIENTVENDORLINKS';
export const actionTypes = createActionTypes(namespace);

// Reducer //
const DEFAULT_DATA_STATE = {
  paths: {},
  items: {},
  uploadedFileNames: [],
};
const DEFAULT_COLLECTION_STATE = {
  _ids: {},
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

    case actionTypes.updateSuccess:
      return {
        ...state,
        created: { ...action.data },
        uploadedFileNames: action.fileName ? [...state.uploadedFileNames, action.fileName] : [...state.uploadedFileNames],
      };
    case actionTypes.updateError:
      return {
        ...state,
        uploadedFileNames: action.fileName ? [...state.uploadedFileNames, action.fileName] : [...state.uploadedFileNames],
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
        return Utils.store.collectionHelper(state, action.collections);
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
export function sync(organizationId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchCollection(`state/clientVendorLinks/${organizationId}/${accountId}`, (items, paths) => {
      const formattedItems = _formatItems(items);

      const collections = Object.keys(formattedItems).reduce((acc, id) => {
        const item = formattedItems[id];
        acc._ids[item._id] = acc._ids[item._id] ? [...acc._ids[item._id], id] : [id];
        return acc;
      }, DEFAULT_COLLECTION_STATE);

      dispatch({ type: actionTypes.fetchSuccess, items: formattedItems, paths, collections });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.clients.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function update(organizationId, accountId, id, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return ClientsAPI.updateClientVendorLink(organizationId, accountId, id, data)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function updateMultiple(organizationId, accountId, items, fileName = '') {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    const chunkSize = 20;
    const chunked = [];
    let buf = [];
    items.forEach((item) => {
      buf.push(item);
      if (buf.length === chunkSize) {
        chunked.push(buf);
        buf = [];
      }
    });
    if (buf.length) chunked.push(buf);

    return chunked.reduce((acc, batch) => {
      return acc.then(() => {
        return ClientsAPI.updateClientVendorLinks(organizationId, accountId, batch);
      });
    }, Promise.resolve())
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess, fileName });
    })
    .catch((error) => {
      // handling timeouts
      dispatch({ type: actionTypes.updateError, fileName, error: error.response.data.error });
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
  return Object.keys(items || {}).reduce((acc, id) => {
    const item = items[id];
    acc[id] = item;
    acc[id].display = (item.displayName && item.displayName !== item.name && `${item.displayName} (${item.name})`) || item.name;
    return acc;
  }, {});
};
