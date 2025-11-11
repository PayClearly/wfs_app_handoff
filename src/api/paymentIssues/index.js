import { api } from 'api/_util/payclearlyapi';

function submitQueuedResolvedIssues(organizationId, accountId, data) {
  return api().post(`/paymentissues/${organizationId}/${accountId}`, data);
}

const scope = {
  submitQueuedResolvedIssues,
};

export default scope;
