import { api } from 'api/_util/payclearlyapi';

function retrieveItem(organizationId, accountId, data) {
  return api().get(`/passwordsIntegration/${organizationId}/${accountId}/${data.vaultId}/${data.itemId}`);
}
const scope = {
  retrieveItem,
};

export default scope;
