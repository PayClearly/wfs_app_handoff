import { api } from 'api/_util/wfsapi';
import Promise from 'bluebird';
import firebase from 'firebase';

function updatePreferences(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

function unlink(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

function link(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

function update(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

function createVCard(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

function updateVCard(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

function createPCard(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

function updatePCard(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

function createAccount(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

async function getVCards(organizationId, accountId, ids) {
  // Add code for database or API integrations

  return false;
}

async function getCardPRNs({ organizationId, accountId, cardIds }) {
  // Add code for database or API integrations

  return false;
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
