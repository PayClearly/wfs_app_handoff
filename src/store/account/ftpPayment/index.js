import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValue, removeListeners } from 'store/_utilities/firebaseHelpers';
import AttachmentsAPI from 'api/attachments';

const namespace = 'FTP_PAYMENT';
export const actionTypes = createActionTypes(namespace);

// Reducer //
export const defaultState = {
  path: {},
  item: {},
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...defaultState };

    case actionTypes.fetchSuccess:
      return {
        ...state,
        item: action.item,
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
export function sync() {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchSuccess, item: {} });
  };
}

export function clear() {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.clear });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

export function fetch(attachmentMetadata) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return AttachmentsAPI.fetchAttachment(attachmentMetadata)
      .then((item) => {
        dispatch({ type: actionTypes.fetchSuccess, item });
      });
  };
}
