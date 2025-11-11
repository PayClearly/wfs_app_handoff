import { api } from 'api/_util/payclearlyapi';
import batchRequester from 'api/_util/batchRequester';

function createExpense(organizationId, accountId, data) {
  return api().post(`/expenses/${organizationId}/${accountId}`, _adaptExpenseToAPI(data));
}

function createExpenses(organizationId, accountId, data) {
  return batchRequester(data.map((expense) => {
    return {
      method: 'POST',
      relURL: `/expenses/${organizationId}/${accountId}`,
      body: _adaptExpenseToAPI(expense),
    };
  }));
}

function updateExpense(organizationId, accountId, id, data) {
  return api().patch(`/expenses/${organizationId}/${accountId}/${id}`, _adaptExpenseToAPI(data, 'update'));
}

function createExpenseReport(organizationId, accountId, data) {
  return api().post(`/expenseReports/${organizationId}/${accountId}`, _adaptExpenseReportToAPI(data));
}

function updateExpenseReport(organizationId, accountId, id, data) {
  return api().patch(`/expenseReports/${organizationId}/${accountId}/${id}`, _adaptExpenseReportToAPI(data, 'update'));
}

function createExpenseReportComment(organizationId, accountId, data) {
  return api().post(`/expenseReportComments/${organizationId}/${accountId}`, _adaptExpenseReportCommentToAPI(data));
}

function updateExpenseReportComment(organizationId, accountId, id, data) {
  return api().patch(`/expenseReportComments/${organizationId}/${accountId}/${id}`, _adaptExpenseReportCommentToAPI(data, 'update'));
}

function createExpenseReportApproval(organizationId, accountId, data) {
  return api().post(`/expenseReportApprovals/${organizationId}/${accountId}`, _adaptExpenseReportApprovalToAPI(data));
}

function updateExpenseReportApproval(organizationId, accountId, id, data) {
  return api().patch(`/expenseReportApprovals/${organizationId}/${accountId}/${id}`, _adaptExpenseReportApprovalToAPI(data, 'update'));
}

const scope = {
  createExpense,
  createExpenses,
  updateExpense,
  createExpenseReport,
  updateExpenseReport,
  createExpenseReportComment,
  updateExpenseReportComment,
  createExpenseReportApproval,
  updateExpenseReportApproval,
};

export default scope;

// private helpers
function _adaptExpenseToAPI(data, action) {
  let adapted = {};
  switch (action) {
    case 'update':
      adapted = { ...data };
      if (!data.reportId) adapted.reportId = null;
      if (data.date) adapted.date = typeof data.date === 'object' ? data.date.setUTCHours(12, 0, 0, 0) : data.date;
      if (data.amount) adapted.amount = parseFloat(data.amount);
      if (data.personal) {
        if (typeof data.personal === 'string') {
          adapted.personal = data.personal !== 'false';
        } else {
          adapted.personal = data.personal;
        }
      } else {
        adapted.personal = null;
      }
      if (data.reimbursable) {
        if (typeof data.reimbursable === 'string') {
          adapted.reimbursable = data.reimbursable !== 'false';
        } else {
          adapted.reimbursable = data.reimbursable;
        }
      } else {
        adapted.reimbursable = null;
      }
      if (!data.receipt) adapted.receipt = null;
      if (!Object.prototype.hasOwnProperty.call(data, 'receipt')) delete adapted.receipt;
      break;
    case 'create':
    default:
      adapted = { ...data };
      if (!data.reportId) adapted.reportId = null;
      if (data.date) adapted.date = typeof data.date === 'object' ? data.date.setUTCHours(12, 0, 0, 0) : data.date;
      if (data.amount) adapted.amount = parseFloat(data.amount);
      if (data.personal) {
        if (typeof data.personal === 'string') {
          adapted.personal = data.personal !== 'false';
        } else {
          adapted.personal = data.personal;
        }
      } else {
        adapted.personal = null;
      }
      if (data.reimbursable) {
        if (typeof data.reimbursable === 'string') {
          adapted.reimbursable = data.reimbursable !== 'false';
        } else {
          adapted.reimbursable = data.reimbursable;
        }
      } else {
        adapted.reimbursable = null;
      }
      break;
  }

  return adapted;
}

function _adaptExpenseReportToAPI(data, action) {
  let adapted = {};
  switch (action) {
    case 'update':
      adapted = { ...data };
      if (adapted.expenseIds) {
        adapted.expenseIds = Object.keys(data.expenseIds).reduce((acc, id) => {
          acc[id] = { _id: id };
          return acc;
        }, {});
      }
      break;
    case 'create':
    default:
      adapted = { ...data };
      if (adapted.expenseIds) {
        adapted.expenseIds = Object.keys(data.expenseIds).reduce((acc, id) => {
          acc[id] = { _id: id };
          return acc;
        }, {});
      }
      break;
  }

  return adapted;
}

function _adaptExpenseReportCommentToAPI(data, action) {
  let adapted = {};
  switch (action) {
    case 'update':
      adapted = { ...data };
      break;
    case 'create':
    default:
      adapted = { ...data };
      break;
  }

  return adapted;
}

function _adaptExpenseReportApprovalToAPI(data, action) {
  let adapted = {};
  switch (action) {
    case 'update':
      adapted = { ...data };
      break;
    case 'create':
    default:
      adapted = { ...data };
      break;
  }

  return adapted;
}

