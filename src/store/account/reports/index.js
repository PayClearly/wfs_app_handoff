import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValue, removeListeners } from 'store/_utilities/firebaseHelpers';
import ReportsAPI from 'api/reports';
import AttachmentsAPI from 'api/attachments';

const namespace = 'REPORTS';
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
      return {
        ...state,
        items: { ...state.items, ...action.items },
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
    return watchValue(`state/reports/${organizationId}/${accountId}`, (items = {}, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, items, paths });
    });
  };
}

export function downloadAttachment(attachmentMetadata) {
  return () => {
    return AttachmentsAPI.downloadAttachment(attachmentMetadata);
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.reports.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function deleteReport(organizationId, accountId, reportTemplateId, reportId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.deleteStart });
    return ReportsAPI.deleteReport(organizationId, accountId, reportTemplateId, reportId)
    .then(() => {
      dispatch({ type: actionTypes.deleteSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.deleteError, error: error.response.data.error });
    });
  };
}

export function create(organizationId, accountId, reportTemplateId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return ReportsAPI.create(organizationId, accountId, reportTemplateId)
    .then(({ data: newReport }) => {
      dispatch({ type: actionTypes.createSuccess });
      return newReport;
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
