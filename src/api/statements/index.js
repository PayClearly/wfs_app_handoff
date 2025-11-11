import { api, database } from 'api/_util/payclearlyapi';

function create(organizationId, accountId, revenueShareId, data) {
  return api().post(`revenue-shares/${organizationId}/${accountId}/${revenueShareId}/statements`, data);
}

function update(organizationId, accountId, revenueShareId, statementId, data) {
  return api().patch(`revenue-shares/${organizationId}/${accountId}/${revenueShareId}/statements/${statementId}`, data);
}

const scope = {
  create,
  update,
};

export default scope;
