import { api } from 'api/_util/payclearlyapi';
// import data from './data.json';

function update(organizationId, accountId, data) {
  return api().post(`/paymentstatuses/${organizationId}/${accountId}`, data);
}

/**
 * 
 * @param {string} organizationId
 * @param {string} accountId
 * @param {string} paymentId
 * @param {{ 'Confirmation Number': string }} data
 */
function updateVendorRemittanceFields(
  organizationId, 
  accountId, 
  paymentId, 
  data
) {
  const path = `/paymentstatuses/${organizationId}/${accountId}/${paymentId}/sent/vendorRemittanceFields`;
  return api().patch(path, { vendorRemittanceFields: data });
}

function get(routeParams) {
  const queryString = buildQueryString(routeParams);
  return api().get(`/paymentstatuses/?${queryString}`)
  .then((res) => res.data);
}
const scope = {
  update,
  get,
  updateVendorRemittanceFields,
};

export default scope;

const buildQueryString = (routeParams) => {
  let stringToReturn = '';
  Object.entries(routeParams).forEach((param) => {
    if (availableQueries[param[0]]) {
      stringToReturn += `${param[0]}=${param[1]}&`;
    }
  });
  // slice off trailing '&'
  return stringToReturn.slice(0, -1);
};

const availableQueries = {
  amount: true,
  method: true,
  cardNumberLastFour: true,
  status: true,
};
