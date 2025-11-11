import { api } from 'api/_util/payclearlyapi';

/**
 * @typedef {import('../../store/global/botWorkers/types').BotworkerUpdate} BotworkerUpdate
 * @typedef {import('../../store/global/botWorkers/types').Botworker} Botworker
 */

async function fetchKeys({ organizationId, status, callback }) {
    let endpoint = `/taikoBots?status=${status}`;
    if (organizationId) {
        endpoint += `&organizationId=${organizationId}`;
    }

    const res = await api().get(endpoint);
    return callback(res.data);
}

async function updateTaikoBot(id, data) {
    return api().patch(`/taikoBots/${id}`, data);
}

async function updateTaikoBotsByIds(updators) {
    return api().patch('/taikoBots', { data: updators });
}

/**
 * 
 * @returns {Promise<Botworker[]>}
 */
async function fetchBotWorkers() {
    const response = await api().get('/botWorkers');
    return response.data;
}

/**
 * 
 * @param {BotworkerUpdate} data 
 */
async function updateBotWorker(data) {
    return api().patch('/botWorkers', data);
}

export default {
    fetchKeys,
    updateTaikoBot,
    updateTaikoBotsByIds,
    fetchBotWorkers,
    updateBotWorker,
};
