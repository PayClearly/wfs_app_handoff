import { api } from 'api/_util/payclearlyapi';

async function fetchFilteredKeys(organizationId, accountId, filters, callback) {
    const res = await api().post(`/paymentFilters/${organizationId}/${accountId}`, filters);
    return callback(res.data.data);
}

const scope = {
    fetchFilteredKeys,
};


export default scope;

