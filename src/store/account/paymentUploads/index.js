import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValue, removeListeners } from 'store/_utilities/firebaseHelpers';
import AttachmentsAPI from 'api/attachments';
import PaymentUploadsAPI from 'api/paymentUploads';

const namespace = 'PAYMENT_UPLOADS';
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
        items: { ...action.items },
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
export function sync(organizationId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchValue(`state/paymentUploads/${organizationId}/${accountId}`, (items, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, items, paths });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.paymentUploads.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

export function fetchPayment(attachmentMetadata) {
  return () => {
    return AttachmentsAPI.fetchAttachment(attachmentMetadata);
  };
}

export function updatePaymentUpload(orgId, acctId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return PaymentUploadsAPI.update(orgId, acctId, data)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}
