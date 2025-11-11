import { combineReducers } from 'redux';
import deepmerge from 'deepmerge';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValue, removeListeners } from 'store/_utilities/firebaseHelpers';
import * as approvedStatements from 'store/statements/approvedStatements';
import StatementsAPI from 'api/statements';
import AttachmentsAPI from 'api/attachments';

const namespace = 'STATEMENTS';
export const actionTypes = createActionTypes(namespace);

// Reducer //
export const defaultState = {
  paths: {},
  items: {},
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...state,
        items: { ...action.items },
        paths: { ...action.paths },
      };

    case actionTypes.fetchSuccess:
      return deepmerge.all([state, action]);
    default:
      return state;

  }
}

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
  approvedStatements: approvedStatements.reducer,
});

export default reducer;

// action creators
export function sync(organizationId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchValue(`state/statements/${organizationId}/${accountId}`, (items, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, items: { [organizationId]: { [accountId]: items } }, paths });
    }).catch((error) => {
      dispatch({ type: actionTypes.fetchError, error: error.response.data.error });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().statements.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function downloadAttachment(attachmentMetadata) {
  return () => {
    return AttachmentsAPI.downloadAttachment(attachmentMetadata);
  };
}

export function update(organizationId, accountId, revenueShareId, statementId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return StatementsAPI.update(organizationId, accountId, revenueShareId, statementId, data)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function create(organizationId, accountId, revenueShareId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return StatementsAPI.create(organizationId, accountId, revenueShareId, data)
    .then(({ data: newStatement }) => {
      dispatch({ type: actionTypes.createSuccess });
      return newStatement;
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}
