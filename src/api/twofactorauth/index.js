import { api } from 'api/_util/payclearlyapi';

function create(data) {
  return api().post('/twofactor/enroll', { ...data });
}

function verify(uid, data) {
  return api().post('/twofactor/verify', { ...data });
}

function fetchQrCode() {
  return api().get('/twofactor/fetchqr');
}

function requestSMS() {
  return api().post('/twofactor/sms');
}

function cancelSetup() {
  return api().post('/twofactor/cancel');
}

function removeTwoFactorAuth(token) {
  return api().post('/twofactor/remove', { token });
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
