import { api } from 'api/_util/payclearlyapi';

function updatePreferences(organizationId, accountId, data) {
  return api().patch(`/achintegration/${organizationId}/${accountId}/preferences`, data);
}

function update(organizationId, accountId, data) {
  return api().patch(`/achintegration/${organizationId}/${accountId}`, data);
}

function unlink(organizationId, accountId, data) {
  return api().delete(`/achintegration/${organizationId}/${accountId}`);
}

function link(organizationId, accountId, data) {
  return api().put(`/achintegration/${organizationId}/${accountId}`, data);
}

function getGroviderSetupResource(organizationId, accountId, resource) {
  return api().get(`/achintegration/${organizationId}/${accountId}/${resource}`);
}

const scope = {
  updatePreferences,
  update,
  unlink,
  link,
  getGroviderSetupResource,
};

export default scope;
