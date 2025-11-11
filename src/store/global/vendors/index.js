import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, removeListeners, watchValue } from 'store/_utilities/firebaseHelpers';
import GlobalVendorAPI from 'api/globalVendors';
import * as groups from 'store/global/groups';

const namespace = 'GLOBALVENDORS';
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
    watchCollection('state/globalVendors/vendors', (data, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, data, paths });
    });
  };
}

export function syncRelevantData(id) {
  return (dispatch, getState) => {        
    dispatch({ type: actionTypes.fetchStart });

    const inStore = getState().global.vendors.data.items[id];
    if (inStore) return dispatch({ type: actionTypes.fetchSuccess });

    return watchValue(`state/globalVendors/vendors/${id}`, (item, path) => {
      dispatch({ type: actionTypes.fetchSuccess, data: { [item._id]: item }, paths: path });
    }, (item, path) => {
      groups.syncRelevantData(item.groupIds)(dispatch, getState);
    });
  };
}
export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().global.vendors.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function create(data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return GlobalVendorAPI.create(_adaptToAPI(data))
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
    return GlobalVendorAPI.update(id, _adaptToAPI(data))
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

function _adaptToAPI(data) {
  const metadata = data.metadata || {
    website: data.website,
    phoneNumber: data.phoneNumber,
    email: data.email,
    address: {
      streetAddress: data.streetAddress,
      unit: data.unit,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
    },
    contacts: data.contacts,
  };
  
  const globalVendor = {
    name: data.name,
    groupIds: _try(() => data.groupIds.length) ? data.groupIds : [],
    active: data.active,
    metadata,
    notifyOnCreation: Object.prototype.hasOwnProperty.call(data, 'notifyOnCreation') ? !!data.notifyOnCreation : null,
    notifyOnCreationEmails: data.notifyOnCreationEmails ? _try(() => data.notifyOnCreationEmails.split(',')) || data.notifyOnCreationEmails : null,
    notifyOnCompletion: Object.prototype.hasOwnProperty.call(data, 'notifyOnCompletion') ? !!data.notifyOnCompletion : null,
    notifyOnCompletionEmails: data.notifyOnCompletionEmails ? _try(() => data.notifyOnCompletionEmails.split(',')) || data.notifyOnCompletionEmails : null,
    notificationFields: data.notificationFields ?
      _try(() => data.notificationFields.split(';').reduce((acc, field) => {
        const [key, value] = field.split(':');
        acc[key] = value;
        return acc;
      }, {}))
      :
      null
    ,
  };
  return globalVendor;
}
