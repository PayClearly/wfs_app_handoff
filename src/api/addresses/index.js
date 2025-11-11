import { api } from 'api/_util/payclearlyapi';

function validateAddress(organizationId, accountId, data) {
  return api().post(`/addresses/${organizationId}/${accountId}`, data)
  .then((response) => {
    return response.data;
  });
}

const scope = {
  validateAddress,
};

export default scope;
