import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, removeListeners, watchSlice } from 'store/_utilities/firebaseHelpers';
import PaymentIssuesAPI from 'api/paymentIssues';

const namespace = 'PAYMENTISSUES';
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
    return watchCollection(`state/paymentIssues/${organizationId}/${accountId}`, (items, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, items, paths });
    });
  };
}

export function syncQueuedResolvedIssues(organizationId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchSlice(`state/paymentIssues/${organizationId}/${accountId}`, { parameter: '_transferStatus', parameterValue: 'queued' }, (items, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, items, paths });
    });
  };
}

export function syncRelevantData(organizationId, accountId, paymentId) {
  return (dispatch, getState) => {
    const payment = getState().account.paymentStatuses.data.items[paymentId];
    const paymentIssues = payment._issueIds; 
    if (!paymentIssues) return;
    const issuesCurrentlyInStore = getState().account.paymentIssues.data.items;
    
    dispatch({ type: actionTypes.fetchStart });
    // dont add a listener if the item is already in the store
    const paymentIssuesToSync = paymentIssues.filter((issueId) => {
      return !issuesCurrentlyInStore[issueId];
    });
    if (!paymentIssuesToSync.length) return dispatch({ type: actionTypes.fetchSuccess });
  
    return Promise.all(
      paymentIssuesToSync.map((issueId) => {
        return watchSlice(`state/paymentIssues/${organizationId}/${accountId}`, { parameter: 'id', parameterValue: issueId }, (items, paths) => {
          dispatch({ type: actionTypes.fetchSuccess, items, paths });
        });
      })
    );  
  };
}
export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.paymentIssues.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function submitQueuedResolvedIssues(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return PaymentIssuesAPI.submitQueuedResolvedIssues(organizationId, accountId, data)
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
