import { api } from 'api/_util/payclearlyapi';

function verify(mailingAddress) {
  return api().post('/usps/verify-address', { mailingAddress });
}

const scope = {
  verify,
};

export default scope;
