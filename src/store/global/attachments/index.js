import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import AttachmentsAPI from 'api/attachments';

const namespace = 'ATTACHMENTS';
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
        items: { ...state.items, ...action.data },
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
export function fetch(attachmentMetadata) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return AttachmentsAPI.fetchAttachment(attachmentMetadata)
      .then((file) => {
        const data = { [attachmentMetadata.md5Hash]: file.preview };
        dispatch({ type: actionTypes.fetchSuccess, data });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.fetchError, error: error.response.data.error });
      });
  };
}

