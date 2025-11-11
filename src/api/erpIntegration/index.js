import { api } from 'api/_util/payclearlyapi';

function updatePreferences(organizationId, accountId, data) {
  return api().patch(`/erpintegration/${organizationId}/${accountId}/preferences`, data);
}

function unlink(organizationId, accountId, data) {
  return api().delete(`/erpintegration/${organizationId}/${accountId}`);
}

function link(organizationId, accountId, data) {
  return api().put(`/erpintegration/${organizationId}/${accountId}`, data);
}

function update(organizationId, accountId, data) {
  return api().patch(`/erpintegration/${organizationId}/${accountId}`, data);
}

function createVendor(organizationId, accountId, data) {
  return api().post(`/erpintegration/${organizationId}/${accountId}/vendor`, data);
}

const scope = {
  updatePreferences,
  unlink,
  link,
  update,
  createVendor,
};

export default scope;
