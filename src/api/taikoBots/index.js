import { api } from 'api/_util/payclearlyapi';

/**
 * @typedef {import('../../store/global/botWorkers/types').BotworkerUpdate} BotworkerUpdate
 * @typedef {import('../../store/global/botWorkers/types').Botworker} Botworker
 */

async function fetchKeys({ organizationId, status, callback }) {
  // Add code for database or API integrations

  return false;
}

async function updateTaikoBot(id, data) {
  // Add code for database or API integrations

  return false;
}

async function updateTaikoBotsByIds(updators) {
  // Add code for database or API integrations

  return false;
}

/**
 *
 * @returns {Promise<Botworker[]>}
 */
async function fetchBotWorkers() {
  // Add code for database or API integrations

  return false;
}

/**
 *
 * @param {BotworkerUpdate} data
 */
async function updateBotWorker(data) {
  // Add code for database or API integrations

  return false;
}

export default {
    fetchKeys,
    updateTaikoBot,
    updateTaikoBotsByIds,
    fetchBotWorkers,
    updateBotWorker,
};
