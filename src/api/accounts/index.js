import { api } from 'api/_util/payclearlyapi';

function create(organizationId, data) {
  return api().post(`/accounts/${organizationId}`, data);
}

function update(organizationId, accountId, data) {
  return api().patch(`/accounts/${organizationId}/${accountId}`, data);
}

function updateAccountOptions(organizationId, accountId, data) {
  return api().patch(`/accounts/${organizationId}/${accountId}/options`, data);
}

// ACH Account Integration
function updateACHAccountCredentials(organizationId, accountId, data) {
  return api().put(`/achaccountcredentials/${organizationId}/${accountId}`, data);
}

function deleteACHCredentials(organizationId, accountId) {
  return api().delete(`/achaccountcredentials/${organizationId}/${accountId}`);
}

function fetchPrivateAchCreds(organizationId, accountId) {
  return api().get(`/achaccountcredentials/secure/${organizationId}/${accountId}`);
}

function updateACHAccountDetailsFundingPreferences(organizationId, accountId, data) {
  return api().patch(`/achaccountdetails/${organizationId}/${accountId}`, data);
}

// Payment Preferences
function updatePaymentCustomFields(organizationId, accountId, data) {
  return api().put(`/paymentcustomfields/${organizationId}/${accountId}`, data);
}

function updatePaymentCardCustomFields(organizationId, accountId, data) {
  return api().put(`/paymentcardcustomfields/${organizationId}/${accountId}`, data);
}

function updatePaymentPipelinePreferences(organizationId, accountId, data) {
  return api().put(`/paymentpipelinepreferences/${organizationId}/${accountId}`, data);
}


function setAccountVendorCredentials(organizationId, accountId, id, data) {
  return api().put(`/accountvendorcredentials/${organizationId}/${accountId}/${id}`, data);
}

function setFtpAccountDetails(organizationId, accountId, data) {
  return api().put(`/ftpaccountdetails/${organizationId}/${accountId}`, data);
}

function updateFtpAccountDetails(organizationId, accountId, data) {
  return api().patch(`/ftpaccountdetails/${organizationId}/${accountId}`, data);
}

const scope = {
  create,
  update,
  updateAccountOptions,
  updateACHAccountCredentials,
  deleteACHCredentials,
  updatePaymentCustomFields,
  updatePaymentCardCustomFields,
  updatePaymentPipelinePreferences,
  setAccountVendorCredentials,
  fetchPrivateAchCreds,
  updateACHAccountDetailsFundingPreferences,
  setFtpAccountDetails,
  updateFtpAccountDetails,
};

export default scope;
