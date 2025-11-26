import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, removeListeners } from 'store/_utilities/firebaseHelpers';
import PaymentCardsAPI from 'api/paymentCards';

const namespace = 'ACCOUNTPAYMENTCARDS';
export const actionTypes = createActionTypes(namespace);

// Reducer //
export const defaultState = {
  paths: {},
  items: {},
  ids: [],
  uploadedFileNames: [],
};

export function _moduleReducers(state = defaultState, action) {
  let newState = {};
  let denormalized = {};

  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    case actionTypes.fetchSuccess:
      newState = {
        ...state,
        items: { ...state.items, ...action.items },
        paths: { ...state.paths, ...action.paths },
      };
      denormalized = _denormalizer(newState);
      return {
        ...newState,
        ...denormalized,
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

// denormalizer

function _denormalizer(state) {

  return {};
}

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
});
export default reducer;

// action creators
export function sync(orgId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchCollection(`state/paymentCards/${orgId}/${accountId}`, (items, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, items, paths });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.paymentCards.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function create(organizationId, accountId, data, fileName = '') {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    const chunkSize = 20;
    const chunked = [];
    let buf = [];
    data.forEach((item) => {
      buf.push(item);
      if (buf.length === chunkSize) {
        chunked.push(buf);
        buf = [];
      }
    });
    if (buf.length) chunked.push(buf);
    return chunked.reduce((acc, batch) => {
      return acc.then(() => {
        return PaymentCardsAPI.create(organizationId, accountId, batch);
      });
    }, Promise.resolve())
    .then((res) => {
      dispatch({ type: actionTypes.createSuccess, data: res.data.purchaseCards[organizationId][accountId], fileName });
    })
    .catch((error) => {
      let errorMessage;
      // handling timeouts
      if (error.message) errorMessage = error.message;
      else errorMessage = error;
      dispatch({ type: actionTypes.createError, fileName, error: typeof errorMessage === 'string' ? { err: errorMessage } : errorMessage.response && errorMessage.response.data && JSON.parse(errorMessage.response.data.error) });
    });
  };
}

export function update(organizationId, accountId, paymentCardIds, data, action) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return PaymentCardsAPI.update(organizationId, accountId, paymentCardIds, data, action)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
    })
    .catch((error) => {
      // temporary error handling since response from server is not always a string
      dispatch({ type: actionTypes.updateError, error: typeof error === 'string' ? error : error.response && error.response.data && error.response.data.error });
    });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}
