import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, removeListeners, watchValue } from 'store/_utilities/firebaseHelpers';
import VendorsAPI from 'api/vendors';
import AddressesAPI from 'api/addresses';
import * as globalVendors from 'store/global/vendors';
import * as metadata from 'store/global/metadata';

const namespace = 'ACCOUNTVENDORS';
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

    case actionTypes.createSuccess:
      return {
        ...state,
        created: { ...action.data },
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
export function sync(organizationId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchCollection(`state/accountVendors/${organizationId}/${accountId}`, (items, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, items: _adaptFrom(items), paths });
    });
  };
}

export function syncRelevantData(organizationId, accountId, paymentId) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
      const vendorId = getState().account.paymentStatuses.data.items[paymentId].created.vendorId;

      const inStore = getState().account.accountVendors.data.items[vendorId];
      if (inStore) return dispatch({ type: actionTypes.fetchSuccess });

      return watchValue(`state/accountVendors/${organizationId}/${accountId}/${vendorId}`, (item, paths) => {
        
        const adapted = adaptFrom(item);
        
        dispatch({ type: actionTypes.fetchSuccess, items: adapted, paths });
        
      }, (item, paths) => {
        if (!item.globalVendorRef) return;

        const globalVendorId = item.globalVendorRef;
  
        Promise.all([
          { key: 'vendors', actionCreators: globalVendors },
          { key: 'metadata', actionCreators: metadata },
        ].map((duck) => {
          const { actionCreators } = duck;
    
          return actionCreators.syncRelevantData(globalVendorId)(dispatch, getState);
        }));
      });
    

  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.vendors.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function create(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return VendorsAPI.createAccountVendor(organizationId, accountId, data)
    .then((res) => {
      dispatch({ type: actionTypes.createSuccess, data: res });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function update(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return VendorsAPI.updateAccountVendor(organizationId, accountId, data)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function validateAddress(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return AddressesAPI.validateAddress(organizationId, accountId, data)
    .then((address) => {
      dispatch({ type: actionTypes.fetchSuccess });
      return address;
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

const _adaptFrom = (items) => {
  return Object.keys(items || {}).reduce((acc, id) => {
    const item = items[id];
    acc[id] = item;
    acc[id].display = (item.displayName && item.displayName !== item.name && `${item.displayName} (${item.name})`) || item.name;
    return acc;
  }, {});
};

const adaptFrom = (item) => {
  const adapted = {};
  adapted[item._id] = item;
  adapted[item._id].display = (item.displayName && item.displayName !== item.name && `${item.displayName} (${item.name})`) || item.name;
  return adapted;
};
