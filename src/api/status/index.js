import { api } from 'api/_util/payclearlyapi';

function update(data) {
  return api().patch('/status', data);
}

const scope = {
  update,
};

export default scope;
