import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import PasswordsAPI from 'api/passwords';

const namespace = 'PASSWORDS';
export const actionTypes = createActionTypes(namespace);

// Reducer //
export const defaultState = {
  items: {},
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    case actionTypes.fetchSuccess:
      return {
        ...state,
        items: { ...action.data },
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
export function fetch(orgainizationId, accountId, _data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return PasswordsAPI.retrieveItem(orgainizationId, accountId, _data)
    .then(({ data }) => {
      dispatch({ type: actionTypes.fetchSuccess, data: data.data });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.fetchError, error });
    });
  };
}

export function clear() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clear });
  };
}
