import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, watchValue, removeListeners } from 'store/_utilities/firebaseHelpers';
import ACHTRANSFERAPI from 'api/achtransfers';

const namespace = 'ACH_TRANSFERS';
export const actionTypes = createActionTypes(namespace);

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

    case actionTypes.updateSuccess:
      return {
        ...state,
        items: { ...state.items, ...action.items },
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
    return watchCollection(`state/achTransfers/${organizationId}/${accountId}`, (items, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, items, paths });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.achTransfers.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

export function syncRelevantData(organizationId, accountId, paymentId) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    const paymentStatus = getState().account.paymentStatuses.data.items[paymentId];

    if (!paymentStatus.funded || !paymentStatus.funded._transferId) return dispatch({ type: actionTypes.fetchSuccess });
    const transferId = paymentStatus.funded._transferId;
    if (getState().account.achTransfers.data.items[transferId]) return dispatch({ type: actionTypes.fetchSuccess });

    return watchValue(`state/achTransfers/${organizationId}/${accountId}/${transferId}`, (item, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, items: { [item.id]: item }, paths });
    });
  };
}

export function create(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return ACHTRANSFERAPI.create(organizationId, accountId, _adaptAchTransferToAPI(data))
    .then((res) => {
      dispatch({ type: actionTypes.createSuccess, data: res });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function updateStatus(organizationId, accountId, id, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return ACHTRANSFERAPI.updateStatus(organizationId, accountId, id, data)
    .then((res) => {
      dispatch({ type: actionTypes.updateSuccess, data: res });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function sendTransfer(organizationId, accountId, id, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return ACHTRANSFERAPI.sendTransfer(organizationId, accountId, id, data)
    .then((res) => {
      dispatch({ type: actionTypes.updateSuccess, data: res });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

// helpers
function _adaptAchTransferToAPI(data) {
  // hard coded the destination funding source id
  return ({
    name: data.fundingSource,
    amount: Number(parseFloat(data.amount).toFixed(2)) || 0,
    note: data.note || null,
    _forPayments: data._forPayments || null,
    _forPaymentCardChangeRequests: data._forPaymentCardChangeRequests || null,
  });
}
