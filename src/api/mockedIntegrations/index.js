import { api } from 'api/_util/payclearlyapi';

function setMock(organizationId, accountId, data) {
  return api().post(`/testmocks/${organizationId}/${accountId}`, _adaptToAPI(data));
}

const scope = {
  setMock,
};

export default scope;

// private helper

function _adaptToAPI(data) {
  const scrubbedItem = Object.keys(data.item || {}).reduce((acc, key) => {
    const value = data.item[key];
    acc[key] = value;
    if (value === '') acc[key] = null;
    return acc;
  }, {});

  return { ...data, item: scrubbedItem };
}
