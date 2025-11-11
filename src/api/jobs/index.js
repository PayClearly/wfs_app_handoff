import { api } from 'api/_util/payclearlyapi';

function fetch(jobType, organizationId, accountId, data) {
  return api().post(`jobs/${jobType}/${organizationId}/${accountId}`, data);
}

function retry(jobType, organizationId, accountId, jobId) {
  return api().post(`jobs/${jobType}/${organizationId}/${accountId}/${jobId}`);
}

function cancel(jobType, organizationId, accountId, jobId) {
  return api().put(`jobs/${jobType}/${organizationId}/${accountId}/${jobId}`);
}

function retryAll(organizationId, accountId, data) {
  return api().post(`jobs/${organizationId}/${accountId}/retryAll`, data);
}

function create(jobType, organizationId, accountId, data) {
  return api().post(`jobs/${jobType}/${organizationId}/${accountId}`, data);
}

const scope = {
  fetch,
  retry,
  cancel,
  retryAll,
  create,
};

export default scope;
