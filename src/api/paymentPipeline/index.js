import { api } from 'api/_util/payclearlyapi';

function update(organizationId, accountId, data) {
  // Add code for database or API integrations

  return false;
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
  // Add code for database or API integrations

  return false;
}

function get(routeParams) {
  // Add code for database or API integrations

  return false;
}
const scope = {
  update,
  get,
  updateVendorRemittanceFields,
};

export default scope;

const buildQueryString = (routeParams) => {
  // Add code for database or API integrations

  return false;
};

const availableQueries = {
  amount: true,
  method: true,
  cardNumberLastFour: true,
  status: true,
};
