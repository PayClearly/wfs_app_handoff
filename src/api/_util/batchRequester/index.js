import { api } from '../payclearlyapi';

export default function batchRequester(requests) {
  return api().post('/batch-requests', requests)
  .then((response) => {
    response.data.data.forEach((request) => {
      if (!request) throw { response: { data: { error: 'At least one request not handled' } } };
      if (request && request.error) throw { response: { data: { error: request.error.message } } };
    });
    return response.data.data;
  });
}
