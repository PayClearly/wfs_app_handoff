import { api } from 'api/_util/payclearlyapi';

function create(organizationId, accountId, data) {
  return api().post(`/achtransfers/${organizationId}/${accountId}`, data);
}

function sendTransfer(organizationId, accountId, id, data) {
  return api().post(`/achtransfers/${organizationId}/${accountId}/${id}/${data._sentBy}`, data);
}

function updateStatus(organizationId, accountId, id, data) {
  return api().patch(`/achtransfers/${organizationId}/${accountId}/${id}/${data.status}`, data);
}

const scope = {
  create,
  updateStatus,
  sendTransfer,
};

export default scope;
