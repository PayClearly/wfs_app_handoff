import { api } from 'api/_util/wfsapi';

function fetch(jobType, organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

function retry(jobType, organizationId, accountId, jobId) {
  // Add code for database or API integrations

  return false;
}

function cancel(jobType, organizationId, accountId, jobId) {
  // Add code for database or API integrations

  return false;
}

function retryAll(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

function create(jobType, organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

const scope = {
  fetch,
  retry,
  cancel,
  retryAll,
  create,
};

export default scope;
