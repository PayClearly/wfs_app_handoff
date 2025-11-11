import { api } from 'api/_util/wfsapi';

/**
 *
 * @param {PctrReportParams} data
 * @returns
 */
function fetch(data) {
  // Add code for database or API integrations

  return false;
}

const scope = {
  fetch,
};

export default scope;

/**
 * @typedef {Object} PctrReportParams
 * @property {string} organizationId
 * @property {string} accountId
 * @property {Date} startDate
 * @property {Date} endDate
 * @property {'pctrAch' | 'pctrCheck' | 'pctrCard'} pctrType
 */


