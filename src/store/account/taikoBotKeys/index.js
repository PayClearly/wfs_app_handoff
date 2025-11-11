import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';

import TaikoBotsAPI from 'api/taikoBots';

const namespace = 'TAIKOBOTKEYS';
export const actionTypes = createActionTypes(namespace);

// Reducer //
export const defaultState = {
  items: [],
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...defaultState };
    case actionTypes.initializeSuccess:
      return { items: action.items };
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

export function sync({ organizationId, status = 'paused' }) {
  return (dispatch) => {
    clear();
    dispatch({ type: actionTypes.initializeStart });

    const callback = (items) => {
      dispatch({ type: actionTypes.initializeSuccess, items });
    };

    return TaikoBotsAPI.fetchKeys({ organizationId, status, callback }).catch((error) => {
      dispatch({ type: actionTypes.initializeError, error: error.response.data.error });
    });
  };
}


export function clear() {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.clear });
  };
}
