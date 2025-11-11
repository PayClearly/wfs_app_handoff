import { api } from 'api/_util/payclearlyapi';

function update(organizationId, accountId, { id, status }) {
  return api().patch(`/paymentUploads/${organizationId}/${accountId}/${id}`, { status });
}

const scope = {
  update,
};

export default scope;
