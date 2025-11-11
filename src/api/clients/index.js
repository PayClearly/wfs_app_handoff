import { api } from 'api/_util/payclearlyapi';
import batchRequester from 'api/_util/batchRequester';

function createClient(organizationId, accountId, data) {
  return api().post(`/clients/${organizationId}/${accountId}`, _adaptClientToAPI(data));
}

function updateClient(organizationId, accountId, _id, data) {
  return api().patch(`/clients/${organizationId}/${accountId}/${_id}`, _adaptClientToAPI(data, 'update'));
}

function createClients(organizationId, accountId, data = []) {
  return batchRequester(data.map((client) => {
    return {
      method: 'POST',
      relURL: `/clients/${organizationId}/${accountId}`,
      body: _adaptClientToAPI(client),
    };
  }));
}

function updateClientVendorLink(organizationId, accountId, _id, data) {
  return api().patch(`/clientVendorLinks/${organizationId}/${accountId}/${_id}`, _adaptClientVendorLinkToAPI(data, 'update'));
}

function updateClientVendorLinks(organizationId, accountId, data = []) {
  return batchRequester(data.map((clientVendorLink) => {
    return {
      method: 'PATCH',
      relURL: `/clientVendorLinks/${organizationId}/${accountId}/${clientVendorLink._id}`,
      body: _adaptClientVendorLinkToAPI(clientVendorLink),
    };
  }));
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
  let adapted = {};
  adapted = { ...data };
  
  if (Object.prototype.hasOwnProperty.call(data, 'displayName') && !data.displayName) adapted.displayName = null;
  if (Object.prototype.hasOwnProperty.call(data, 'contactName') && !data.contactName) adapted.contactName = null;
  if (Object.prototype.hasOwnProperty.call(data, 'contactEmail') && !data.contactEmail) adapted.contactEmail = null;

  switch (action) {
    case 'update':
      break;
    case 'create':
    default:
      break;
  }

  return adapted;
}

function _adaptClientVendorLinkToAPI(data, action) {
  let adapted = {};
  adapted = { ...data };

  delete adapted.vendorName;
  delete adapted.vendorId;
  delete adapted.clientName;
  delete adapted.clientId;
  delete adapted._id;
  
  switch (action) {
    case 'update':
      break;
    default:
      break;
  }

  return adapted;
}
