import { api } from 'api/_util/payclearlyapi';

function create(data) {
  return api().post('/globalVendors/schemas', data);
}

function update(schemaId, data) {
  return api().patch(`/globalVendors/schemas/${schemaId}`, data);
}

const scope = {
  create,
  update,
};

export default scope;
