import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';

const namespace = 'APPCONFIG';
export const actionTypes = createActionTypes(namespace);

// Reducer //
export const defaultState = {
  config: {},
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    // case actionTypes.fetchSuccess:
    //   return {
    //     ...state,
    //     items: { ...state.items, ...action.data },
    //     paths: { ...state.paths, ...action.paths },
    //   };

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
// export function sync() {
//   return (dispatch, getState) => {
//     dispatch({ type: actionTypes.fetchStart });
//     return watchCollection('integrationDefinitions', (data, paths) => {
//       dispatch({ type: actionTypes.fetchSuccess, data, paths });
//     });
//   };
// }

// export function clear() {
//   return (dispatch, getState) => {
//     removeListeners(getState().integrationDefinitions.data.paths);
//     dispatch({ type: actionTypes.clear });
//   };
// }
