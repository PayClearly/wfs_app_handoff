import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import PctrReport from 'api/pctrReport';

const namespace = 'PCTR_REPORT';
export const actionTypes = createActionTypes(namespace);

export const defaultState = {
  paths: {},
  items: [],
};

export function _moduleReducers(state = defaultState, action) { // eslint-disable-line
  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    case actionTypes.fetchSuccess:
      return {
        ...state,
        items: action.items,
        paths: { ...action.paths },
        message: action.message || '',
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

export function clear() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clear });
  };
}

export function fetch(startDate, endDate, pctrType) {
  return (dispatch, getState) => {
    const organizationId = getState().organization.data.id;
    const accountId = getState().account.data.id;

    dispatch({ type: actionTypes.fetchStart });
    return PctrReport.fetch({
      organizationId, accountId, startDate, endDate, pctrType,
    }).then(({ data }) => {
      dispatch({ type: actionTypes.fetchSuccess, items: data });
    }).catch((error) => {
      dispatch({ type: actionTypes.fetchError, error: error.response.data.error });
    });
  };
}
