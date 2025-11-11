import { api } from 'api/_util/payclearlyapi';

function updatePreferences(organizationId, accountId, data) {
  return api().patch(`/fundingintegration/${organizationId}/${accountId}/preferences`, data);
}

function unlink(organizationId, accountId, data) {
  return api().delete(`/fundingintegration/${organizationId}/${accountId}`);
}

function link(organizationId, accountId, data) {
  return api().put(`/fundingintegration/${organizationId}/${accountId}`, data);
}

function update(organizationId, accountId, data) {
  return api().patch(`/fundingintegration/${organizationId}/${accountId}`, data);
}

function createTransfer(organizationId, accountId, data) {
  return api().post(`/fundingintegration/${organizationId}/${accountId}/transfer`, data);
}

function updateTransfer(organizationId, accountId, data) {
  return api().post(`/fundingintegration/${organizationId}/${accountId}/transfer/${data.id}`, data);
}

const scope = {
  updatePreferences,
  unlink,
  link,
  update,
  createTransfer,
  updateTransfer,
};

export default scope;
