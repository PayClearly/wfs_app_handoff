import { api } from 'api/_util/payclearlyapi';

function create(organizationId, accountId, data) {
  return api().post(`/report-templates/${organizationId}/${accountId}`, data);
}

function update(organizationId, accountId, reportTemplateId, data) {
  return api().patch(`/report-templates/${organizationId}/${accountId}/${reportTemplateId}`, data);
}

const scope = {
  create,
  update,
};

export default scope;
