import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, removeListeners } from 'store/_utilities/firebaseHelpers';
import ExpensesAPI from 'api/expenses';

const namespace = 'EXPENSEREPORTS';
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
    return watchCollection(`state/expenseReports/${organizationId}/${accountId}`, (items, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, items, paths });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.expenseReports.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function create(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    const expensesToCreate = Object.values(data.expenseIds).filter(expense => expense.fromTransaction);

    if (expensesToCreate.length) {
      return ExpensesAPI.createExpenses(organizationId, accountId, expensesToCreate)
      .then((res) => {
        const updatedData = Object.assign({}, data);
        res.forEach((response) => {
          const newExpense = response.body.data;
          delete updatedData.expenseIds[newExpense.sourceId];
          updatedData.expenseIds[newExpense._id] = newExpense;
        });
        return ExpensesAPI.createExpenseReport(organizationId, accountId, updatedData);
      })
      .then((res) => {
        dispatch({ type: actionTypes.createSuccess, data: res });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.createError, error: error.response.data.error });
      });
    }

    return ExpensesAPI.createExpenseReport(organizationId, accountId, data)
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
    let expensesToCreate = [];
    if (data.expenseIds) expensesToCreate = Object.values(data.expenseIds).filter(expense => expense.fromTransaction);
    if (expensesToCreate.length) {
      return ExpensesAPI.createExpenses(organizationId, accountId, expensesToCreate)
      .then((res) => {
        const updatedData = Object.assign({}, data);
        res.forEach((response) => {
          const newExpense = response.body.data;
          delete updatedData.expenseIds[newExpense.sourceId];
          updatedData.expenseIds[newExpense._id] = newExpense;
        });
        return ExpensesAPI.updateExpenseReport(organizationId, accountId, id, updatedData)
      })
      .then((res) => {
        dispatch({ type: actionTypes.updateSuccess, data: res });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.createEupdateErrorrror, error: error.response.data.error });
      });
    }

    return ExpensesAPI.updateExpenseReport(organizationId, accountId, id, data)
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
