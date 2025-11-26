import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, removeListeners } from 'store/_utilities/firebaseHelpers';

const namespace = 'GLOBALVENDORBULKUPLOADS';

export const actionTypes = createActionTypes(namespace);

export const defaultState = {
  paths: {},
  items: {},
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {
    case actionTypes.clear: {
      return { ...defaultState };
    }

    case actionTypes.fetchSuccess: {
      return {
        ...state,
        items: { ...state.items, ...action.data },
        paths: { ...state.paths, ...action.paths },
      };
    }

    default: {
      return state;
    }
  }
}

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
});

export default reducer;

export function sync() {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    watchCollection('state/jobs/bulkVendorUpload/global/global', (data, paths) => {
      const filtered = Object.entries(data || {}).reduce((acc, [id, job]) => {
        const { setters, ...metadata } = job.metadata;

        return {
          ...acc,
          [id]: {
            ...job,
            metadata,
          },
        };
      }, {});

      dispatch({
        type: actionTypes.fetchSuccess,
        data: filtered,
        paths,
      });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().jobs.bulkVendorUploads.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function fetch() {
  return (_dispatch, _getState) => {
    /**

     * This is exported because fetch is expected to exist in the outer reducers.

     */
  };
}
