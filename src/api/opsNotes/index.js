import { api } from 'api/_util/payclearlyapi';

function create(context, data) {
  return api().post(`/opsNotes/${context.resource}/${context.organizationId}/${context.accountId}/${context.resourceId}`, data);

}

const scope = {
 create,
};

export default scope;
