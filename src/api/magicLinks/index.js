import { api } from 'api/_util/payclearlyapi';

function fetchMagicLinkData(token) {
  return api(token).get('/magic-links');
}

function patchMagicLinkData(token, data) {
  return api(token).post('/magic-links', data);
}

module.exports = {
  fetchMagicLinkData,
  patchMagicLinkData,
};

