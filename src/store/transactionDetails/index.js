import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { removeListeners } from 'store/_utilities/firebaseHelpers';
import TransactionDetails from 'api/transactionDetails';

const namespace = 'TRANSACTION_DETAILS';
export const actionTypes = createActionTypes(namespace);

// Reducer //
export const defaultState = {
  paths: {},
  items: [],
};

export function _moduleReducers(state = defaultState, action) {
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
  return (dispatch, getState) => {
    removeListeners(getState().statements.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function fetch(startDate, endDate, fields = []) {
  return (dispatch, getState) => {
    const organizationId = getState().organization.data.id;
    const accountId = getState().account.data.id;

    dispatch({ type: actionTypes.fetchStart });
    if (getState().appConfig.data.metadata.name === 'wfs') {
      const userRoles = getState().user.roles.data.item;
      const userAccountRoles = userRoles.accountLevel && Object.keys(userRoles.accountLevel[organizationId][accountId]);
      if (userAccountRoles && userAccountRoles.includes('wfs_myWorldCard:CustomerCardholder')) {
        const userId = getState().user.access.data.uid;
        const plasticCards = Object.values(getState().account.cardsIntegration.data.resources.pCards);
        const hasAssignedCards = !!plasticCards.filter((val) => val.assignedTo === userId).length;
        if (!hasAssignedCards) {
          return dispatch({ type: actionTypes.fetchSuccess, items: [], message: 'no card assigned' });
        }
      }
    }
    return TransactionDetails.fetch(organizationId, accountId, { startDate, endDate, fields }).then(({ data }) => {
      dispatch({ type: actionTypes.fetchSuccess, items: data });
    }).catch((error) => {
      dispatch({ type: actionTypes.fetchError, error: error.response.data.error });
    });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}
