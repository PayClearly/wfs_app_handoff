import { api } from 'api/_util/wfsapi';

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
  // Add code for database or API integrations

  return false;
}

/**
 *
 * @param {GetSftpUser} data
 * @returns
 */
async function getSftpUser(accountId) {
  // Add code for database or API integrations

  return false;
}

/**
 *
 * @param {UpdateSftpUser} data
 * @returns
 */
async function updateSftpUser({ id, ...rest }) {
  // Add code for database or API integrations

  return false;
}

export default {
  createSftpUser,
  getSftpUser,
  updateSftpUser,
};
