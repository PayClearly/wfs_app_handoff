import { api } from 'api/_util/payclearlyapi';

function fetchIavToken(organizationId, accountId) {
  return api().get(`/ach/${organizationId}/${accountId}/iav-tokens`);
}

function create(organizationId, accountId, data) {
  return api().post(`/ach/${organizationId}/${accountId}/accounts`, data);
}

function update(organizationId, accountId, data) {
  return api().put(`/ach/${organizationId}/${accountId}/accounts/`, data);
}

function fetchBusinessClassifications(organizationId, accountId) {
  return api().get(`/ach/${organizationId}/${accountId}/business-classifications`);
}

function submitDocuments(organizationId, accountId, data, query) {
  // filter out non files
  if (!data.files.length) { return Promise.resolve({ data: { attachments: [] } }); }
  if (data.files[0] && data.files[0]._createdBy) { return Promise.resolve({ data: { attachments: data.files } }); }

  const documentData = new FormData();
  documentData.append('file', data.files[0]);
  documentData.append('documentType', data.documentType);

  return api(false, { 'Content-Type': 'multipart/form-data' }).put(`/ach/${organizationId}/${accountId}/documents${query ? `?context=${query}` : ''}`, documentData);
}

function addBeneficialOwner(organizationId, accountId, data) {
  return api().put(`/ach/${organizationId}/${accountId}/beneficial-owner`, data);
}

function updateBeneficialOwner(organizationId, accountId, data) {
  return api().patch(`/ach/${organizationId}/${accountId}/beneficial-owner/`, data);
}

function addFundingSource(organizationId, accountId, data) {
  return api().put(`/ach/${organizationId}/${accountId}/funding-source/`, data);
}

function certifyBeneficialOwnership(organizationId, accountId, data) {
  return api().put(`/ach/${organizationId}/${accountId}/certify-ownership`, data);
}

const scope = {
  fetchIavToken,
  create,
  update,
  fetchBusinessClassifications,
  submitDocuments,
  addBeneficialOwner,
  updateBeneficialOwner,
  addFundingSource,
  certifyBeneficialOwnership,
};

export default scope;
