import { api } from 'api/_util/wfsapi';

function create(organizationId, accountId, reportTemplateId) {
  // Add code for database or API integrations

  return false;
}

function deleteReport(organizationId, accountId, reportTemplateId, reportId) {
  // Add code for database or API integrations

  return false;
}

function getBatchReport(organizationId, accountId, batchId) {
  // Add code for database or API integrations

  return false;
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
  // Add code for database or API integrations

  return false;
}

const scope = {
  create,
  deleteReport,
  getBatchReport,
  fetch,
};

export default scope;
