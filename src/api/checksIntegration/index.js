import { api } from 'api/_util/payclearlyapi';

function updatePreferences(organizationId, accountId, data) {
  return api().patch(`/checksintegration/${organizationId}/${accountId}/preferences`, data);
}

function update(organizationId, accountId, data) {
  return api().patch(`/checksintegration/${organizationId}/${accountId}`, data);
}

function unlink(organizationId, accountId, data) {
  return api().delete(`/checksintegration/${organizationId}/${accountId}`);
}

function link(organizationId, accountId, data) {
  return api().put(`/checksintegration/${organizationId}/${accountId}`, data);
}

function getProviderSetupResource(organizationId, accountId, resource) {
  return api().get(`/checksIntegration/${organizationId}/${accountId}/${resource}`);
}

const scope = {
  updatePreferences,
  update,
  unlink,
  link,
  getProviderSetupResource,
};

export default scope;
