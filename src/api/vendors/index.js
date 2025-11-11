import { api } from 'api/_util/payclearlyapi';
import batchRequester from 'api/_util/batchRequester';

function create(organizationId, accountId, data) {
  return api().post(`/vendors/${organizationId}/${accountId}`, data);
}

function updateVendor(organizationId, accountId, vendorId, data) {
  return api().patch(`/vendors/${organizationId}/${accountId}/${vendorId}`, data);
}

function updatePaymentStrategies(organizationId, accountId, vendorId, data) {
  return api().patch(`/vendorPaymentStrategies/${organizationId}/${accountId}/${vendorId}`, data);
}

function createAccountVendor(organizationId, accountId, data = []) {
  return api().post(`/accountvendors/${organizationId}/${accountId}`, data.map(vendor => _adaptAccountVendorToAPI(vendor, 'create')));
}

function updateAccountVendor(organizationId, accountId, data) {
  return api().patch(`/accountvendors/${organizationId}/${accountId}`, _adaptAccountVendorToAPI(data, 'update'));
}

function updateAccountVendorEnrollment(organizationId, accountId, id, data) {
  return batchRequester([
    {
      method: 'PATCH',
      relURL: `/accountVendorEnrollments/${organizationId}/${accountId}/${id}`,
      body: _adaptAccountVendorEnrollmentToAPI(data),
    },
    {
      method: 'PATCH',
      relURL: `/accountVendorEnrollmentNotes/${organizationId}/${accountId}/${id}`,
      body: _adaptAccountVendorEnrollmentNoteToAPI(data),
    },
  ]);
}

function getAccountVendorEnrollmentNotes(organizationId, accountId) {
  return api().get(`/accountVendorEnrollmentNotes/${organizationId}/${accountId}`);
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
  const adapted = { ...data };

  if (Object.prototype.hasOwnProperty.call(data, 'displayName')) adapted.displayName = data.displayName || null;
  if (Object.prototype.hasOwnProperty.call(data, 'globalVendorRef')) adapted.globalVendorRef = data.globalVendorRef || null;
  // if (!data.repEmails || !data.repEmails.length) adapted.repEmails = null;

  // Contact Info
  if (Object.prototype.hasOwnProperty.call(data, 'contactName')) adapted.contactName = data.contactName || null;
  if (Object.prototype.hasOwnProperty.call(data, 'contactEmail')) adapted.contactEmail = data.contactEmail || null;
  if (Object.prototype.hasOwnProperty.call(data, 'contactPhoneNumber')) adapted.contactPhoneNumber = data.contactPhoneNumber || null;
  if (Object.prototype.hasOwnProperty.call(data, 'contactFaxNumber')) adapted.contactFaxNumber = data.contactFaxNumber || null;
  
  // vCard
  if (Object.prototype.hasOwnProperty.call(data, 'vCard')) adapted.vCard = booleanize(data.vCard);
  if (Object.prototype.hasOwnProperty.call(data, 'vCardPaymentLimit')) adapted.vCardPaymentLimit = data.vCardPaymentLimit || null;
  if (Object.prototype.hasOwnProperty.call(data, 'vCardFee')) adapted.vCardFee = data.vCardFee || null;
  if (Object.prototype.hasOwnProperty.call(data, 'vCardFeeType')) delete adapted.vCardFeeType;
  if (Object.prototype.hasOwnProperty.call(data, 'vCardFeeValue')) delete adapted.vCardFeeValue;
  // if (!data.vCardEmails || !data.vCardEmails.length) adapted.vCardEmails = null;
  // if (!data.vCardFaxNumbers || !data.vCardFaxNumbers.length) adapted.vCardFaxNumbers = null;
  
  // check
  if (Object.prototype.hasOwnProperty.call(data, 'check')) adapted.check = booleanize(data.check);
  if (Object.prototype.hasOwnProperty.call(data, 'checkAddressLine1')) adapted.checkAddressLine1 = data.checkAddressLine1 || null;
  if (Object.prototype.hasOwnProperty.call(data, 'checkAddressLine2')) adapted.checkAddressLine2 = data.checkAddressLine2 || null;
  if (Object.prototype.hasOwnProperty.call(data, 'checkAddressLine3')) adapted.checkAddressLine3 = data.checkAddressLine3 || null;
  if (Object.prototype.hasOwnProperty.call(data, 'checkCity')) adapted.checkCity = data.checkCity || null;
  if (Object.prototype.hasOwnProperty.call(data, 'checkStateProv')) adapted.checkStateProv = data.checkStateProv || null;
  if (Object.prototype.hasOwnProperty.call(data, 'checkPostalCode')) adapted.checkPostalCode = data.checkPostalCode || null;
  if (Object.prototype.hasOwnProperty.call(data, 'checkCountry')) adapted.checkCountry = data.checkCountry || null;
  if (Object.prototype.hasOwnProperty.call(data, 'checkAddressValidated')) adapted.checkAddressValidated = data.checkAddressValidated || null;
  if (Object.prototype.hasOwnProperty.call(data, 'checkAddressUserForceValidated')) adapted.checkAddressUserForceValidated = data.checkAddressUserForceValidated || null;
  
  // ACH
  if (Object.prototype.hasOwnProperty.call(data, 'ACH')) adapted.ACH = booleanize(data.ACH);
  
  // ERP
  if (Object.prototype.hasOwnProperty.call(data, 'erpVendor')) adapted.erpVendor = data.erpVendor || null;
  if (Object.prototype.hasOwnProperty.call(data, 'erpClass')) adapted.erpClass = data.erpClass || null;
  if (Object.prototype.hasOwnProperty.call(data, 'erpCategory')) adapted.erpCategory = data.erpCategory || null;
  if (Object.prototype.hasOwnProperty.call(data, 'erpAccount')) adapted.erpAccount = data.erpAccount || null;

  switch (action) {
    case 'update':
      break;
    case 'create':
      break;
    default:
      break;
  }

  return adapted;
}

function _adaptAccountVendorEnrollmentToAPI(data) {
  const adapted = {
    status: data.status,
  };

  adapted.assignedTo = data.assignedTo ? data.assignedTo : null;
  adapted.spendProjection = data.spendProjection ? parseFloat(data.spendProjection) : null;

  return adapted;
}

function _adaptAccountVendorEnrollmentNoteToAPI(data) {
  const adapted = {
    notes: data.notes || null,
  };

  return adapted;
}

function booleanize(boolOrStr) {
  if (typeof boolOrStr === 'boolean') return boolOrStr;
  if (typeof boolOrStr === 'string') return { true: true, false: false }[boolOrStr.toLowerCase()];
  return null;
}
