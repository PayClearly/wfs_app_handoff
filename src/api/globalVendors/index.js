import { api, database } from 'api/_util/payclearlyapi';

function create(data) {
  return api().post('/globalVendors/vendors', data);
}

function update(vendorId, data) {
  return api().patch(`/globalVendors/vendors/${vendorId}`, data);
}

function createGroup(data) {
  return api().post('/globalVendors/groups', data);
}

function updateGroup(groupId, data) {
  return api().patch(`/globalVendors/groups/${groupId}`, data);
}

function createTag(data) {
  return api().post('/globalVendors/tags', data);
}

function updateTag(tagId, data) {
  return api().patch(`/globalVendors/tags/${tagId}`, data);
}

function createProcedure(data) {
  return api().post('/globalVendors/procedures', data);
}

function updateProcedure(procedureId, data) {
  return api().patch(`/globalVendors/procedures/${procedureId}`, data);
}

function createCredentialSchema(data) {
  return api().post('/globalVendors/credentialSchemas', data);
}

function updateCredentialSchema(schemaId, data) {
  return api().patch(`/globalVendors/credentialSchemas/${schemaId}`, data);
}

function resendACHTermsAndConditionsEmail(procedureId, data) {
  return api().post(`/globalvendors/procedures/${procedureId}/resend-ach-terms-and-conditions-email`, data);
}

function updatePrefill(attachmentId, data) {
  return api().put(`/globalVendors/prefills/${attachmentId}`, data);
}

function acceptTermsAndConditions(token) {
  return api(token).post('/globalvendors/accept-terms-and-conditions');
}

function fetchLatestTermsAndConditions(timestamp) {
  return database().get(`/termsAndConditions/${timestamp}.json`);
}

const scope = {
  create,
  update,
  createGroup,
  updateGroup,
  createTag,
  updateTag,
  createProcedure,
  updateProcedure,
  createCredentialSchema,
  updateCredentialSchema,
  updatePrefill,
  acceptTermsAndConditions,
  fetchLatestTermsAndConditions,
  resendACHTermsAndConditionsEmail,
};

export default scope;
