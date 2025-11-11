import { api } from 'api/_util/payclearlyapi';

/**
 * @typedef {{
 *  username: string,
 *  password: string,
 *  accountId: string,
 *  organizationId: string,
 *  whitelist?: string,
 *  }} CreateSftpUser
 */

/**
 * @typedef {{
 *  password?: string,
 *  accountId: string,
 *  organizationId: string,
 *  whitelist?: string,
 *  id: string,
 *  username: string,
 *  active: boolean,
 *  }} UpdateSftpUser
 */

/**
 * @typedef {{
 *  accountId: string,
 *  organizationId: string,
 * }} GetSftpUser
 */

/**
 * 
 * @param {CreateSftpUser} data 
 * @returns 
 */
async function createSftpUser(data) {
  return api().post('/sftp/users', data);
}

/**
 * 
 * @param {GetSftpUser} data 
 * @returns 
 */
async function getSftpUser(accountId) {
  return api().get(`/sftp/users/${accountId}`);
}

/**
 * 
 * @param {UpdateSftpUser} data 
 * @returns 
 */
async function updateSftpUser({ id, ...rest }) {
  return api().put(`/sftp/users/${id}`, { ...rest });
}

export default {
  createSftpUser,
  getSftpUser,
  updateSftpUser,
};
