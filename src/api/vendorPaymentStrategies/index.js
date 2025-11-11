import { api } from 'api/_util/payclearlyapi';

function update(organizationId, accountId, vendorId, data) {
  return api().patch(`/vendorPaymentStrategies/${organizationId}/${accountId}/${vendorId}`, data);
}

const scope = {
  update,
};

export default scope;
