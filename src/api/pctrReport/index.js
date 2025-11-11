import { api } from 'api/_util/payclearlyapi';

/**
 * 
 * @param {PctrReportParams} data 
 * @returns 
 */
function fetch(data) {
  return api().post(`/reports/${data.pctrType}`, data);
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


