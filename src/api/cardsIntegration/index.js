import { api } from 'api/_util/payclearlyapi';
import Promise from 'bluebird';
import firebase from 'firebase';

function updatePreferences(organizationId, accountId, data) {
  return api().patch(`/cardsintegration/${organizationId}/${accountId}/preferences`, data);
}

function unlink(organizationId, accountId, data) {
  return api().delete(`/cardsintegration/${organizationId}/${accountId}`);
}

function link(organizationId, accountId, data) {
  return api().put(`/cardsintegration/${organizationId}/${accountId}`, data);
}

function update(organizationId, accountId, data) {
  return api().patch(`/cardsintegration/${organizationId}/${accountId}`, data);
}

function createVCard(organizationId, accountId, data) {
  return api().post(`/cardsintegration/${organizationId}/${accountId}/vcard`, data);
}

function updateVCard(organizationId, accountId, data) {
  return api().patch(`/cardsintegration/${organizationId}/${accountId}/vcard/${data.id}`, data);
}

function createPCard(organizationId, accountId, data) {
  return api().post(`/cardsintegration/${organizationId}/${accountId}/pcard`, data);
}

function updatePCard(organizationId, accountId, data) {
  return api().patch(`/cardsintegration/${organizationId}/${accountId}/pcard/${data.id}`, data);
}

function createAccount(organizationId, accountId, data) {
  return api().post(`/cardsintegration/${organizationId}/${accountId}/account`, data);
}

async function getVCards(organizationId, accountId, ids) {
  const token = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true);
  let failures = [];
  let items = await Promise.map(ids, (id) => api(token).get(`/cardsintegration/${organizationId}/${accountId}/vcard/${id}`).catch((err) => {
    failures.push(id);
  }), { concurrency: 10 });

  let retry = [...failures];
  failures = [];
  await Promise.map(retry, (id) => api(token).get(`/cardsintegration/${organizationId}/${accountId}/vcard/${id}`).then((item) => items.push(item)).catch((err) => {
    failures.push(id);
  }), { concurrency: 10 });

  retry = [...failures];
  failures = [];
  await Promise.map(retry, (id) => api(token).get(`/cardsintegration/${organizationId}/${accountId}/vcard/${id}`).then((item) => items.push(item)).catch((err) => {
    failures.push(id);
  }), { concurrency: 10 });

  items = items.filter((item) => item !== undefined);

  return items.reduce((acc, item, index) => {
    const id = ids[index];
    acc[id] = item.data.data;
    return acc;
  }, {});
}

async function getCardPRNs({ organizationId, accountId, cardIds }) {
  const token = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true);
  let items = await Promise.map(cardIds, (id) => api(token).get(`/cardsintegration/${organizationId}/${accountId}/cardPRN/${id}`).catch((err) => {
  }), { concurrency: 10 });

  items = items.filter((item) => item !== undefined);

  return items.reduce((acc, item, index) => {
    const id = cardIds[index];
    acc[id] = item.data.data;
    return acc;
  }, {});
}

const scope = {
  updatePreferences,
  unlink,
  link,
  update,
  getVCards,
  getCardPRNs,
  createVCard,
  updateVCard,
  createPCard,
  updatePCard,
  createAccount,
};

export default scope;
