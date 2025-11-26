import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, removeListeners } from 'store/_utilities/firebaseHelpers';
import InvoicesAPI from 'api/invoices';

const namespace = 'INVOICES';
export const actionTypes = createActionTypes(namespace);

// Reducer //
export const defaultState = {
  paths: {},
  items: {},
};

export function _moduleReducers(state = defaultState, action) {

  let newState = {};

  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    case actionTypes.fetchSuccess:
      newState = {
        items: { ...state.items, ...action.items },
        paths: { ...state.paths, ...action.paths },
        created: { ...state.created },
      };
      return {
        ...newState,
        // ...denormalized,
      };

    case actionTypes.updateSuccess:
      return {
        ...state,
        lastAction: action.action,
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

// denormalizer

//   paymentStatusIds.forEach((id) => {
//       paymentsByBatch[batchId].push(id);
//       paymentsByBatch[batchId] = [id];

//     paymentsByBatch,

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
});

export default reducer;

// action creators
export function sync(organizationId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchCollection(`state/invoices/${organizationId}/${accountId}`, (items, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, items, paths });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.invoices.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

export function upload(organizationId, accountId, invoices) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return InvoicesAPI.upload(organizationId, accountId, invoices)
    .then(({ data }) => {
      dispatch({ type: actionTypes.createSuccess, data });
      return data;
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function update(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return InvoicesAPI.update(organizationId, accountId, data)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
    })
    .catch((error) => {
      // temporary error handling since response from server is not always a string
      dispatch({ type: actionTypes.updateError, error: typeof error === 'string' ? error : error.response && error.response.data && error.response.data.error });
    });
  };
}
