import { api } from 'api/_util/wfsapi';

function create(data) {
  // Add code for database or API integrations

  return false;
}

function verify(uid, data) {
  // Add code for database or API integrations

  return false;
}

function fetchQrCode() {
  // Add code for database or API integrations

  return false;
}

function requestSMS() {
  // Add code for database or API integrations

  return false;
}

function cancelSetup() {
  // Add code for database or API integrations

  return false;
}

function removeTwoFactorAuth(token) {
  // Add code for database or API integrations

  return false;
}

const scope = {
  create,
  verify,
  fetchQrCode,
  requestSMS,
  cancelSetup,
  removeTwoFactorAuth,
};

export default scope;
