import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValue, removeListeners } from 'store/_utilities/firebaseHelpers';
import featuresAPI from 'api/features';

const namespace = 'USERFEATUREFLAGS';
export const actionTypes = createActionTypes(namespace);

export const defaultState = {
  paths: {},
  item: {},
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    case actionTypes.fetchSuccess:
      return {
        ...state,
        item: { ...action.data },
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
export function sync(orgId, accId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchValue(`state/featureFlags/${orgId}/${accId}`, (data, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, data, paths });
    });
  };
}

export function update(orgId, accId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return featuresAPI.update(orgId, accId, data)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().user.policies.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}
