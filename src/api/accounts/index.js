import { api } from 'api/_util/wfsapi';

function create(organizationId, data) {
  // Add code for database or API integrations

  return false;
}

function update(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

function updateAccountOptions(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

// ACH Account Integration
function updateACHAccountCredentials(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

function deleteACHCredentials(organizationId, accountId) {
  // Add code for database or API integrations

  return false;
}

function fetchPrivateAchCreds(organizationId, accountId) {
  // Add code for database or API integrations

  return false;
}

function updateACHAccountDetailsFundingPreferences(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

// Payment Preferences
function updatePaymentCustomFields(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

function updatePaymentCardCustomFields(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

function updatePaymentPipelinePreferences(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}


function setAccountVendorCredentials(organizationId, accountId, id, data) {
  // Add code for database or API integrations

  return false;
}

function setFtpAccountDetails(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

function updateFtpAccountDetails(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
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
