import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, removeListeners, watchSlice } from 'store/_utilities/firebaseHelpers';
import ClientsAPI from 'api/clients';

// import Utils from 'utils';

const namespace = 'CLIENTS';
export const actionTypes = createActionTypes(namespace);

// Reducer //
const DEFAULT_DATA_STATE = {
  paths: {},
  items: {},
  uploadedFileNames: [],
};
const DEFAULT_COLLECTION_STATE = {
  names: {},
  _ids: {},
  displayNames: {},
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

    case actionTypes.createSuccess:
      return {
        ...state,
        created: { ...action.data },
        uploadedFileNames: action.fileName ? [...state.uploadedFileNames, action.fileName] : [...state.uploadedFileNames],
      };
    case actionTypes.createError:
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
export function sync(organizationId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchCollection(`state/clients/${organizationId}/${accountId}`, (items, paths) => {
      const formattedItems = _formatItems(items);

      const collections = Object.keys(formattedItems).reduce((acc, id) => {
        const item = formattedItems[id];
        acc.names[item.name] = acc.names[item.name] ? [...acc.names[item.name], id] : [id];
        acc._ids[item._id] = acc._ids[item._id] ? [...acc._ids[item._id], id] : [id];
        acc.displayNames[item.displayName] = acc.displayNames[item.displayName] ? [...acc.displayNames[item.displayName], id] : [id];
        return acc;
      }, DEFAULT_COLLECTION_STATE);

      dispatch({ type: actionTypes.fetchSuccess, items: formattedItems, paths, collections });
    });
  };
}

export function syncRelevantData(organizationId, accountId, paymentId) {
  return (dispatch, getState) => {
    const payment = getState().account.paymentStatuses.data.items[paymentId];
    const clientId = payment.created && payment.created.clientId ? payment.created.clientId : null;
    if (!clientId) return;
    const clientsInStore = getState().account.clients.data.items;
    dispatch({ type: actionTypes.fetchStart });
    
    // don't add a listener if client already in store
    let isInStore;
    Object.keys(clientsInStore).forEach((key) => {
      const client = clientsInStore[key];
      if (client._id === clientId) isInStore = true;
    });
    if (isInStore) return dispatch({ type: actionTypes.fetchSuccess });

    return watchSlice(`state/clients/${organizationId}/${accountId}`, { parameter: '_id', parameterValue: clientId }, (items, paths) => {

      const formattedItems = _formatItems(items);

      const collections = Object.keys(formattedItems).reduce((acc, id) => {
        const item = formattedItems[id];
        acc.names[item.name] = acc.names[item.name] ? [...acc.names[item.name], id] : [id];
        acc._ids[item._id] = acc._ids[item._id] ? [...acc._ids[item._id], id] : [id];
        acc.displayNames[item.displayName] = acc.displayNames[item.displayName] ? [...acc.displayNames[item.displayName], id] : [id];
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

export function create(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return ClientsAPI.createClient(organizationId, accountId, data)
    .then(() => {
      dispatch({ type: actionTypes.createSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function update(organizationId, accountId, id, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return ClientsAPI.updateClient(organizationId, accountId, id, data)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function createMultiple(organizationId, accountId, items, fileName = '') {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
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
        return ClientsAPI.createClients(organizationId, accountId, batch);
      });
    }, Promise.resolve())
    .then(() => {
      dispatch({ type: actionTypes.createSuccess, fileName });
    })
    .catch((error) => {
      // handling timeouts
      dispatch({ type: actionTypes.createError, fileName, error: error.response.data.error });
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
  return Object.keys(items || {}).reduce((acc, id) => {
    const item = items[id];
    acc[id] = item;
    acc[id].display = (item.displayName && item.displayName !== item.name && `${item.displayName} (${item.name})`) || item.name;
    return acc;
  }, {});
};
