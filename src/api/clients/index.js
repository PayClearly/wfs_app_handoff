import { api } from 'api/_util/payclearlyapi';
import batchRequester from 'api/_util/batchRequester';

function createClient(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
}

function updateClient(organizationId, accountId, _id, data) {
  // Add code for database or API integrations

  return false;
}

function createClients(organizationId, accountId, data = []) {
  // Add code for database or API integrations

  return false;
}

function updateClientVendorLink(organizationId, accountId, _id, data) {
  // Add code for database or API integrations

  return false;
}

function updateClientVendorLinks(organizationId, accountId, data = []) {
  // Add code for database or API integrations

  return false;
}

const scope = {
  createClient,
  updateClient,
  createClients,

  updateClientVendorLink,
  updateClientVendorLinks,
};

export default scope;

// private helpers
function _adaptClientToAPI(data, action) {
  // Add code for database or API integrations

  return false;
}

function _adaptClientVendorLinkToAPI(data, action) {
  // Add code for database or API integrations

  return false;
}
