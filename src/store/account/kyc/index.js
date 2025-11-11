import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, removeListeners } from 'store/_utilities/firebaseHelpers';
import KycAPI from 'api/kyc';

const namespace = 'KYC';
export const actionTypes = createActionTypes(namespace);

// Reducer //
const DEFAULT_DATA_STATE = {
  paths: {},
  items: {
    customers: {},
    business: {},
  },
};

export function _moduleReducers(state = DEFAULT_DATA_STATE, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...DEFAULT_DATA_STATE };

    case actionTypes.fetchSuccess:
      const items = { ...state.items, ...action.items };
      const fetchData = action.data ? { ...action.data.data } : null;
      const customerInfo = fetchData ? { ...fetchData.data } : null;
      if (customerInfo) items.fetchedCustomer = { ...customerInfo };
      return {
        ...state,
        items,
        paths: { ...state.paths, ...action.paths },
      };

    case actionTypes.createSuccess:
      if (!action.data) return { ...state };
      return {
        ...state,
        created: { ...state.data, ...action.data },
        items: { customers: { ...state.items.customers, ...action.data.customers }, },
      };
    case actionTypes.updateSuccess:
      return {
        ...state,
        items: { ...state.items, ...action.data },
      };
    case actionTypes.createError:
      return {
        ...state,
        error: action.error,
      };
    case actionTypes.updateError:
      return {
        ...state,
        error: action.error,
      };
    default:
      return state;
  }
};

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
});

export default reducer;

// action creators
export function sync(organizationId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchCollection(`state/kyc/${organizationId}/${accountId}`, (items, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, items, paths });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.clients.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function createBusinessEnrollment(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return KycAPI.createBusinessEnrollment(organizationId, accountId, data)
      .then(() => dispatch({ type: actionTypes.createSuccess }))
      .catch(error => dispatch({ type: actionTypes.createError, error: error.response.data.error }));
  };
}

export function enrollCustomer(organizationId, accountId, data) {
  return (dispatch) => {
    // We need to have customerId (pathId) returned on any status from the api
    // Add error to the customer so that we can reflect it in the overview
    dispatch({ type: actionTypes.createStart });
    return KycAPI.enrollCustomer(organizationId, accountId, data)
    .then(() => dispatch({ type: actionTypes.createSuccess }))
    .catch(error => dispatch({ type: actionTypes.createError, error: error.response.data.error }));
  }
}

export function updateCustomer(organizationId, accountId, data, customerId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return KycAPI.updateCustomer(organizationId, accountId, data, customerId)
    .then(() => dispatch({ type: actionTypes.updateSuccess }))
    .catch(error => dispatch({ type: actionTypes.updateError, error: error.response.data.error }));
  };
}

export function deleteCustomer(organizationId, accountId, customerId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return KycAPI.deleteCustomer(organizationId, accountId, customerId)
      .then(() => dispatch({ type: actionTypes.updateSuccess }))
      .catch(error => dispatch({ type: actionTypes.updateError, error: error.response.data.error }));
  };
}

export function retrieveCustomer(organizationId, accountId, id) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    // Needs to return the data to the component and not into the store
    return KycAPI.retrieveCustomer(organizationId, accountId, id)
    .then((data) => { dispatch({ type: actionTypes.fetchSuccess, data }) })
    .catch(error => dispatch({ type: actionTypes.fetchError, error: error.response.data.error }));
  };
}

export function clearFetchedCustomerEnrollment() {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });
    // Needs to just remove customer info from our store ( aka: fetchedCustomer: null )
    const data = getState().account.kyc.data;
    data.items.fetchedCustomer = {};
    return dispatch({ type: actionTypes.updateSuccess, data });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}
