import { api } from 'api/_util/payclearlyapi';

function create(organizationId, accountId, data) {
  const formData = new FormData();
  formData.append('payments', JSON.stringify(data.payments));
  formData.append('files', data.acceptedFile);
  formData.append('legacyUploader', true);
  return api().post(`/payments/${organizationId}/${accountId}`, formData);
}

function createWithText(organizationId, accountId, data) {
  return api(false, { 'Content-Type': data.contentType, 'x-paymentupload-id': data.paymentUploadId }).post(`/payments/${organizationId}/${accountId}`, data.payments);
}

const scope = {
  create,
  createWithText,
};

export default scope;
