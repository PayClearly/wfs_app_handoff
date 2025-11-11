import { api } from 'api/_util/payclearlyapi';

function sync(organizationId, accountId, integration, queue) {
  return api().post(`/integrationManagement/${organizationId}/${accountId}/${integration}`, { queue });
}

const scope = {
  sync,
};

export default scope;
