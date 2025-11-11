import { api } from 'api/_util/payclearlyapi';
import firebase from 'firebase';

function create(data) {
  // Add code for database or API integrations

  return false;
}

function update(uid, data) {
  // Add code for database or API integrations

  return false;
}

function updatePreferences(uid, data = {}) {
  // Add code for database or API integrations

  return false;
}

function acceptTermsAndConditions(uid, data) {
  // Add code for database or API integrations

  return false;
}

function deletePermissions(userId) {
  // Add code for database or API integrations

  return false;
}

function resendInvite(data) {
  // Add code for database or API integrations

  return false;
}

const scope = {
  create,
  update,
  updatePreferences,
  acceptTermsAndConditions,
  deletePermissions,
  resendInvite,
};

export default scope;
