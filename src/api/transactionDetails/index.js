import { api } from 'api/_util/payclearlyapi';

function fetch(organizationId, accountId, data) {
  return api().post(`/transaction-details/${organizationId}/${accountId}`, data);
}

const scope = {
  fetch,
};

export default scope;
