import { api } from 'api/_util/payclearlyapi';

function create(data) {
  return api().post('/organizations', data);
}

function update(organizationId, data) {
  return api().patch(`/organizations/${organizationId}`, data);
}

const scope = {
  create,
  update,
};

export default scope;
