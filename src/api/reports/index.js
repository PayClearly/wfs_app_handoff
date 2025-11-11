import { api } from 'api/_util/payclearlyapi';

function create(organizationId, accountId, reportTemplateId) {
  return api().post(`report-templates/${organizationId}/${accountId}/${reportTemplateId}/reports`);
}

function deleteReport(organizationId, accountId, reportTemplateId, reportId) {
  return api().delete(`report-templates/${organizationId}/${accountId}/${reportTemplateId}/reports/${reportId}`);
}

function getBatchReport(organizationId, accountId, batchId) {
  return api().post('reports/batch', { organizationId, accountId, batchId });
}

/**
 * @param {{
 *  organizationId: string,
 *  accountId: string,
 *  startDate: Date,
 *  endDate: Date,
 *  type: 'pctrAch' | 'pctrCheck' | 'pctrCard' | 'checkActivity'
 * }} data 
 * @returns 
 */
function fetch({ type, ...data }) {
  return api().post(`/reports/${type}`, data);
}

const scope = {
  create,
  deleteReport,
  getBatchReport,
  fetch,
};

export default scope;
