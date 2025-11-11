import { api } from 'api/_util/payclearlyapi';

function create(organizationId, accountId, data) {
  return api().post(`/revenue-shares/${organizationId}/${accountId}`, data);
}

function update(organizationId, accountId, revenueShareId, data) {
  return api().patch(`/revenue-shares/${organizationId}/${accountId}/${revenueShareId}`, data);
}

const scope = {
  create,
  update,
};

export default scope;
