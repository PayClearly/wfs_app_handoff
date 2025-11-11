import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import CardsIntegrationAPI from 'api/cardsIntegration';

const namespace = 'PRIVATECARDPRN';
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
export function fetch(orgainizationId, accountId, ids) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return CardsIntegrationAPI.getCardPRNs(orgainizationId, accountId, ids)
    .then((data) => {
      dispatch({ type: actionTypes.fetchSuccess, data });
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
