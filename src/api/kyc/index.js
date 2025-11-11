import { api } from 'api/_util/payclearlyapi';

function createBusinessEnrollment(organizationId, accountId, data) {
  return api().post(`/kyc/${organizationId}/${accountId}/business`, data);
}

function enrollCustomer(organizationId, accountId, data) {
  // data must be of structure { providerName, ...data };
  return api().post(`/kyc/${organizationId}/${accountId}/customer`, data);
}

function updateCustomer(organizationId, accountId, data, customerId) {
  // data must be of structure { providerName, ...data };
  return api().patch(`/kyc/${organizationId}/${accountId}/customer/${customerId}`, data);
}

function deleteCustomer(organizationId, accountId, customerId) {
  return api().delete(`/kyc/${organizationId}/${accountId}/customer/${customerId}`);
}

function retrieveCustomer(organizationId, accountId, id) {
  // data must be of structure { providerName, ...data };
  return api().get(`/kyc/${organizationId}/${accountId}/customer/${id}`);
}
const scope = {
  createBusinessEnrollment,
  enrollCustomer,
  updateCustomer,
  deleteCustomer,
  retrieveCustomer,
};

export default scope;

// private helpers
