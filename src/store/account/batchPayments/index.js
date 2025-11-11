import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, removeListeners } from 'store/_utilities/firebaseHelpers';
import Utils from 'utils';

const namespace = 'BATCHPAYMENTS';
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
        items: { ...state.items, ...action.items },
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
export function sync(organizationId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchCollection(`denormalized/batchHistoryTable/${organizationId}/${accountId}`,
      (items, paths) => {
        const adapted = Object.keys(items || {}).reduce((acc, curr) => {
          const batch = items[curr];

          const vCardTotal = batch.vCardAmounts ? sumPaymentAmounts(batch.vCardAmounts) : (batch.vCardTotal || 0);
          const checkTotal = batch.checkAmounts ? sumPaymentAmounts(batch.checkAmounts) : (batch.checkTotal || 0); 
          const ACHTotal = batch.ACHAmounts ? sumPaymentAmounts(batch.ACHAmounts) : (batch.ACHTotal || 0);

          const vCardCount = Object.keys(batch.vCardPayments || {}).length;
          const checkCount = Object.keys(batch.checkPayments || {}).length;
          const achCount = Object.keys(batch.ACHPayments || {}).length;
          const paymentCount = vCardCount + checkCount + achCount;
          const commissionCount = Object.keys(batch.commissionPayments || {}).length;
          
          const statuses = [...Object.values(batch.ACHPayments || {}), ...Object.values(batch.checkPayments || {}), ...Object.values(batch.vCardPayments || {})];
          const paymentStatuses = statuses.reduce((acc1, curr1) => {
            acc1[curr1] = (acc1[curr1] || 0) + 1;
            return acc1;
          }, {});
          
          const batchStatus = Utils.getBatchStatus(paymentStatuses, batch.requiresApproval, batch.scheduled, paymentCount);
          const isCancelled = batchStatus && batchStatus.status === 'Cancelled';

          const fundingStatuses = ['Funding...', 'Verifying...', 'Needs Approval', 'Pending...'];
          const isFunded = batchStatus && !fundingStatuses.includes(batchStatus.status || '');
          const needsFunding = !isCancelled && !isFunded;
          acc[curr] = { 
            ...batch, 
            ...batchStatus, 
            paymentCount, 
            vCardCount, 
            checkCount, 
            achCount, 
            commissionCount, 
            isCancelled, 
            needsFunding,
            vCardTotal,
            checkTotal,
            ACHTotal,
            total: vCardTotal + checkTotal + ACHTotal,
          };

          return acc;
        }, {});
        dispatch({ type: actionTypes.fetchSuccess, items: adapted, paths });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.batchPayments.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

function sumPaymentAmounts(amounts) {
  return Object.values(amounts || {}).reduce((acc, curr) => {
    return acc + curr;
  }, 0);
}
