import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, removeListeners } from 'store/_utilities/firebaseHelpers';
import ExpensesAPI from 'api/expenses';
import AttachmentsAPI from 'api/attachments';

const namespace = 'EXPENSES';
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

    case actionTypes.createSuccess:
      return {
        ...state,
        created: { ...action.data },
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
    return watchCollection(`state/expenses/${organizationId}/${accountId}`, (items, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, items, paths });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.expenses.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function create(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    let createData = { ...data };
    if (data.receipt) {
      createData = { ...data };
      delete createData.receipt;
    }
    return ExpensesAPI.createExpense(organizationId, accountId, createData)
    .then((res) => {
      if (data.receipt && _try(() => res.data.data._id)) {
        const expenseId = res.data.data._id;
        const storagePath = `attachments/expenses/${organizationId}/${accountId}/${expenseId}`;
        return AttachmentsAPI.create(data.receipt, storagePath)
        .then((attachmentResponse) => {
          const updateData = {
            receipt: attachmentResponse.data.attachments[0],
          };
          return ExpensesAPI.updateExpense(organizationId, accountId, expenseId, updateData);
        });
      }
      return Promise.resolve(res);
    })
    .then((res) => {
      dispatch({ type: actionTypes.createSuccess, data: res });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function update(organizationId, accountId, id, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    if (data.receipt && !data.receipt.storagePath) {
      return AttachmentsAPI.create(data.receipt, `attachments/expenses/${organizationId}/${accountId}/${id}`)
      .then((attachmentResponse) => {
        const updateData = {
          ...data,
          receipt: attachmentResponse.data.attachments[0],
        };
        return ExpensesAPI.updateExpense(organizationId, accountId, id, updateData);
      })
      .then(() => {
        dispatch({ type: actionTypes.updateSuccess });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.updateError, error: error.response.data.error });
      });  
    }
    return ExpensesAPI.updateExpense(organizationId, accountId, id, data)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}
