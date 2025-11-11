import { api } from 'api/_util/payclearlyapi';
import firebase from 'firebase';

function create(data) {
  return api().post('/users', { ...data });
}

function update(uid, data) {
  return api().patch(`/users/${uid}`, data);
}

function updatePreferences(uid, data = {}) {
  const dataToWrite = Object.keys(data).reduce((acc, key) => {
    const val = data[key];
    if (val !== undefined) {
      acc[key] = val;
    }
    return acc;
  }, {});
  return firebase.database().ref(`default/state/userPreferences/${uid}`).update({
    ...dataToWrite,
  });
}

function acceptTermsAndConditions(uid, data) {
  return api().patch(`/users/${uid}/accept-terms-and-conditions`, data);
}

function deletePermissions(userId) {
  return api().delete(`/permissions/${userId}`);
}

function resendInvite(data) {
  return api().post('/resendinvite', data);
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
