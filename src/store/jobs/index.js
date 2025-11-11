import { combineReducers } from 'redux';
import { createActionTypes } from 'store/_utilities/statusReducerFactory';
import JobsAPI from 'api/jobs';
import * as statements from 'store/jobs/statements';
import * as transactionDetails from 'store/jobs/transactionDetails';
import * as reports from 'store/jobs/reports';
import * as payments from 'store/jobs/payments';
import * as createBatchPayment from 'store/jobs/createBatchPayment';
import * as updateBatchPayment from 'store/jobs/updateBatchPayment';
import * as paymentPipeline from 'store/jobs/paymentPipeline';
import * as generateOutputFile from 'store/jobs/generateOutputFile';
import * as wfsTransfers from 'store/jobs/wfsTransfers';
import * as wfsTransactions from 'store/jobs/wfsTransactions';
import * as bulkVendorUploads from 'store/jobs/bulkVendorUploads';

const namespace = 'JOBS';
export const actionTypes = createActionTypes(namespace);

const reducers = {
  statements,
  transactionDetails,
  reports,
  payments,
  createBatchPayment,
  updateBatchPayment,
  paymentPipeline,
  generateOutputFile,
  wfsTransfers,
  wfsTransactions,
  bulkVendorUploads,
};

// Reducer //
export const reducer = combineReducers(Object.keys(reducers).reduce((acc, cur) => {
  acc[cur] = reducers[cur].reducer;
  return acc;
}, {}));

export default reducer;

// action creators
export function sync(organizationId, accountId) {
  return (dispatch, getState) => Promise.all([
    statements.sync(organizationId, accountId)(dispatch, getState),
    payments.sync(organizationId, accountId)(dispatch, getState),
    bulkVendorUploads.sync()(dispatch, getState),
  ]);
}

export function clear() {
  return (dispatch, getState) => {
    statements.clear()(dispatch, getState);
    transactionDetails.clear()(dispatch, getState);
    reports.clear()(dispatch, getState);
    payments.clear()(dispatch, getState);
    paymentPipeline.clear()(dispatch, getState);
    createBatchPayment.clear()(dispatch, getState);
    updateBatchPayment.clear()(dispatch, getState);
    generateOutputFile.clear()(dispatch, getState);
    wfsTransfers.clear()(dispatch, getState);
    wfsTransactions.clear()(dispatch, getState);
    bulkVendorUploads.clear()(dispatch, getState);
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

export function fetch(data) {
  return (dispatch, getState) => {
    const accountId = getState().account.data.id;
    const organizationId = getState().organization.data.id;
    Object.keys(reducers).forEach((_reducer) => reducers[_reducer].fetch(organizationId, accountId, data)(dispatch));
  };
}

export function retry(jobType, jobId) {
  return (dispatch, getState) => {
    const accountId = getState().account.data.id;
    const organizationId = getState().organization.data.id;
    return JobsAPI.retry(jobType, organizationId, accountId, jobId);
  };
}

export function cancel(jobType, jobId) {
  return (dispatch, getState) => {
    const accountId = getState().account.data.id;
    const organizationId = getState().organization.data.id;
    return JobsAPI.cancel(jobType, organizationId, accountId, jobId);
  };
}

export function retryAllJobs(jobs) {
  return (dispatch, getState) => {
    const accountId = getState().account.data.id;
    const organizationId = getState().organization.data.id;
    return JobsAPI.retryAll(organizationId, accountId, jobs);
  };
}

export function create(jobType, batchId, filename = null) {
  return (dispatch, getState) => {
    const accountId = getState().account.data.id;
    const organizationId = getState().organization.data.id;
    return JobsAPI.create(jobType, organizationId, accountId, {
      metadata: {
        _batchId: batchId,
        accountId,
        organizationId,
        filename,
      },
    });
  };
}

export function fetchGenerateOutputFileJobs(data) {
  return (dispatch, getState) => {
    const accountId = getState().account.data.id;
    const organizationId = getState().organization.data.id;
    generateOutputFile.fetch(organizationId, accountId, data)(dispatch);
  };
}

export function downloadAttachment(data) {
  return (dispatch, getState) => generateOutputFile.downloadAttachment(data)(dispatch, getState);
}
