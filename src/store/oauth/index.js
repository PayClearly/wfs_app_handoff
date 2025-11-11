import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';

// Action Creators
import { navigateTo } from 'store/router';
import { linkIntegration } from 'store/account';
import Utils from 'utils';

const namespace = 'OAUTH';
export const actionTypes = createActionTypes(namespace);
// Reducer //
export const defaultState = {};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    default:
      return state;

  }
}

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
});
export default reducer;
