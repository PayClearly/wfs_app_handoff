import { api } from 'api/_util/payclearlyapi';

function update(orgId, accountId, data) {
  return api().post(`/features/${orgId}/${accountId}`, { ...data });
}

const scope = {
  update,
};

export default scope;
