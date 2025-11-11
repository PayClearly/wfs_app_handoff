import { api } from 'api/_util/payclearlyapi';

function add(userId, orgId, accountId, data) {
  return api().post(`/notificationPreferences/${orgId}/${accountId}/${userId}`, { ...data });
}

function update(userId, orgId, accountId, data) {
  return api().patch(`/notificationPreferences/${orgId}/${accountId}/${userId}`, { ...data });
}

const scope = {
  add,
  update,
};

export default scope;
