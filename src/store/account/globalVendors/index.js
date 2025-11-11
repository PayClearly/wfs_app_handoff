import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValue, watchCollection, removeListeners } from 'store/_utilities/firebaseHelpers';

import Utils from 'utils';

const namespace = 'ACCOUNTGLOBALVENDORS';
export const actionTypes = createActionTypes(namespace);

// Reducer //
export const defaultState = {
  paths: {},
  items: {},
  tagIds: [],
  schemas: {},
  credentialSchemas: {},
  loadedTags: {},
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    case actionTypes.fetchSuccess:
      return {
        ...state,
        items: { ...state.items, ...action.items },
        schemas: { ...state.schemas, ...action.schemas },
        credentialSchemas: { ...state.credentialSchemas, ...action.credentialSchemas },
        paths: { ...state.paths, ...action.paths },
        tagIds: action.tagIds ? [...action.tagIds] : [...state.tagIds],
        loadedTags: { ...state.loadedTags, ...(action.loadedTags || {}) },
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

export function sync(organizationId, accountId) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchValue(`state/paymentPipelinePreferences/${organizationId}/${accountId}/globalVendorTagIds`, (tagIds, paths) => {
      _syncTags(tagIds)(dispatch, getState);
      dispatch({
 type: actionTypes.fetchSuccess, tagIds: tagIds || [], paths, items: {}, schemas: {}, credentialSchemas: {}, 
});
    });
  };
}

function _syncTags(tagIds) {
  return (dispatch, getState) => {
    (tagIds || []).forEach((tagId) => {
      if (getState().account.globalVendors.data.tagIds.indexOf(tagId) < 0) {
        watchCollection(`denormalized/globalVendors/tagsToVendors/items/${tagId}`, (items, paths) => _adaptCompressedGlobalVendors(getState().account.globalVendors.data.items || {}, items, tagId)
          .then((adaptedItems) => {
            dispatch({
 type: actionTypes.fetchSuccess, items: adaptedItems, paths, schemas: {}, credentialSchemas: {}, loadedTags: { [tagId]: true }, 
});
          }));
      }
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.globalVendors.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

// _helpers
function _adaptCompressedGlobalVendors(currentItems, newItem, tagId) {
  return Utils.backgroundtask({ currentItems, newItem, tagId }, (params) => {
    const { currentItems, newItem, tagId } = params;

    return Object.keys(newItem || {})
    .reduce((acc, key) => {
      const vendorId = key;
      const item = newItem[key];
      const name = item.v;
      const groupId = item.g;
      const active = Object.prototype.hasOwnProperty.call(item, 'a') ? !!item.a : true;

      const tags = _try(() => ({ ...params.currentItems[vendorId].tags })) || {};

      tags[tagId] = groupId;

      acc[vendorId] = {
        id: vendorId,
        name,
        tags,
        active,
      };

      return acc;
    }, {});
  });
}
