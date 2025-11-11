import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, removeListeners, watchValue } from 'store/_utilities/firebaseHelpers';
import GlobalVendorAPI from 'api/globalVendors';
import * as tags from 'store/global/tags';
import * as procedures from 'store/global/procedures';
import * as credentialSchemas from 'store/global/credentialSchemas';
import * as schemas from 'store/global/schemas';

const namespace = 'GLOBALVENDORGROUPS';
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
    watchCollection('state/globalVendors/groups', (data, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, data: { ...data }, paths });
    });
  };
}

export function syncRelevantData(groupIds) {
  return (dispatch, getState) => Promise.all(groupIds.map((groupId) => {
      dispatch({ type: actionTypes.fetchStart });

      const inStore = getState().global.groups.data.items[groupId];
      if (inStore) { return dispatch({ type: actionTypes.fetchSuccess }); }

      return watchValue(`state/globalVendors/groups/${groupId}`, (item, path) => {
        dispatch({ type: actionTypes.fetchSuccess, data: { [item._id]: item }, paths: path });
      }, (item, path) => {
        const methods = ['ACH', 'vCard', 'check'];
        methods.forEach((method) => {
          schemas.syncRelevantData(item[method].paymentSchema)(dispatch, getState);
          credentialSchemas.syncRelevantData(item[method].credentialSchema)(dispatch, getState);
          procedures.syncRelevantData(item[method].procedure)(dispatch, getState);
        });
        tags.syncRelevantData(item.tagIds)(dispatch, getState);
      });
    }));
}
export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().global.groups.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function create(data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return GlobalVendorAPI.createGroup(_adaptToAPI(data))
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
    return GlobalVendorAPI.updateGroup(id, _adaptToAPI(data))
      .then(() => {
        dispatch({ type: actionTypes.updateSuccess });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.updateError, error: error.response.data.error });
      });
  };
}

export function updatePSOP(id, data, method) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return GlobalVendorAPI.updateGroup(id, _adaptPSOPToAPI(data, method))
      .then(() => {
        dispatch({ type: actionTypes.updateSuccess });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.updateError, error: error.response.data.error });
      });
  };
}

export function clearErrors() {
  return (dispatch) => dispatch({ type: actionTypes.clearErrors, data: {} });
}

// private helpers

function _adaptToAPI(data) {
  const group = {
    name: data.name,
    active: data.active,
    tagIds: _try(() => data.tagIds.length) ? data.tagIds : [],
  };

  return group;
}

function _adaptPSOPToAPI(data, method) {
  const psop = {
    [method]: data,
  };
  
  return psop;
}
