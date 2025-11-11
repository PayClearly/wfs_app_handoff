import { api } from 'api/_util/payclearlyapi';

function updateRoles(level, organizationId, accountId, data) {
  switch (level) {
    case 'root':
      return api().post('/permissions/grantRoles/root/', data);
    case 'organization':
      return api().post(`/permissions/grantRoles/organization/${organizationId}`, data);
    case 'account':
      return api().post(`/permissions/grantRoles/account/${organizationId}/${accountId}`, data);
    default:
      throw new Error('role level');
  }
}

const scope = {
  updateRoles,
};

export default scope;
