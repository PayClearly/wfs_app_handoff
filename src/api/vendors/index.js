import { api } from 'api/_util/wfsapi';
import batchRequester from 'api/_util/batchRequester';

function create(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

function updateVendor(organizationId, accountId, vendorId, data) {
  // Add code for database or API integrations

  return false;
}

function updatePaymentStrategies(organizationId, accountId, vendorId, data) {
  // Add code for database or API integrations

  return false;
}

function createAccountVendor(organizationId, accountId, data = []) {
  // Add code for database or API integrations

  return false;
}

function updateAccountVendor(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

function updateAccountVendorEnrollment(organizationId, accountId, id, data) {
  // Add code for database or API integrations

  return false;
}

function getAccountVendorEnrollmentNotes(organizationId, accountId) {
  // Add code for database or API integrations

  return false;
}

const scope = {
  create,
  updateVendor,
  updatePaymentStrategies,
  createAccountVendor,
  updateAccountVendor,
  updateAccountVendorEnrollment,
  getAccountVendorEnrollmentNotes,
};

export default scope;

// private helpers
function _adaptAccountVendorToAPI(data, action) {
  // Add code for database or API integrations

  return false;
}

function _adaptAccountVendorEnrollmentToAPI(data) {
  // Add code for database or API integrations

  return false;
}

function _adaptAccountVendorEnrollmentNoteToAPI(data) {
  // Add code for database or API integrations

  return false;
}

function booleanize(boolOrStr) {
  // Add code for database or API integrations

  return false;
}
