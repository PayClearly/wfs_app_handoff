import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { removeListeners } from 'store/_utilities/firebaseHelpers';
import MOCKEDINTEGRATIONSAPI from 'api/mockedIntegrations';

const namespace = 'MOCKEDINTEGRATIONS';
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

// export function sync() {
//   return (dispatch, getState) => {
//     dispatch({ type: actionTypes.fetchStart });
//     watchCollection('integrationDefinitions', (data, paths) => {
//       dispatch({ type: actionTypes.fetchSuccess, data, paths });
//     });
//   };
// }

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().integrationDefinitions.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function setMock(data) {
  /*
    data: {
      integration: string --> the Integration name in definition file
      type: string --> the resource name in definition file
      item: object --> the data object that the item should be set to, if has id will be update
    }
  */

  return (dispatch, getState) => {
    const forUpdate = _try(() => data.id);

    const organizationId = getState().organization.data.id;
    const accountId = getState().account.data.id;

    dispatch({ type: forUpdate ? actionTypes.updateStart : actionTypes.createStart });
    return MOCKEDINTEGRATIONSAPI.setMock(organizationId, accountId, data)
    .then((res) => {
      dispatch({ type: forUpdate ? actionTypes.updateSuccess : actionTypes.createSuccess, data: res });
    })
    .catch((error) => {
      dispatch({ type: forUpdate ? actionTypes.updateError : actionTypes.createError, error: error.response.data.error });
    });
  };
}
