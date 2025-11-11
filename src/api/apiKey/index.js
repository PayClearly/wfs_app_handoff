import { api } from 'api/_util/payclearlyapi';

function create(organizationId, accountId, data) {
  return api().post(`/api-keys/${organizationId}/${accountId}`, data);
}

function update(organizationId, accountId, apiKeyId, data) {
  return api().patch(`/api-keys/${organizationId}/${accountId}/${apiKeyId}`, data);
}

const scope = {
  create,
  update,
};

export default scope;
