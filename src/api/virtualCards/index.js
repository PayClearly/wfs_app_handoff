import { api } from 'api/_util/payclearlyapi';

function update(organizationId, accountId, data) {
  return api().patch(`/cards/${organizationId}/${accountId}/${data.id}`, data);
}

function create(data) {
  return api().post(`/cards/${data.organizationId}/${data.accountId}`, _adaptToAPI(data))
  .then((res) => {
    return res.data;
  });
}

function fetchPrivate(data) {
  return Promise.all(
    data.ids.map((cardId) => {
      return _fetchPrivate({ ...data, cardId });
    }),
  )
  .then((cards) => {
    return cards.reduce((acc, card) => {
      acc[card.id] = card;
      return acc;
    }, {});
  });
}

const scope = {
  update,
  create,
  fetchPrivate,
};

export default scope;


// _helpers
function _adaptToAPI(data) {
    // adapt valid through to UTC noon
    const validThroughUTCNoon = _try(() => new Date(data.validThrough));
    _try(() => validThroughUTCNoon.setUTCHours(12, 0, 0, 0));
  
  const toReturn = {
    amount: Number(parseFloat(data.amount).toFixed(2)),
    maxUses: parseInt(data.numberOfUses, 10),
    region: data.region,
    exactMatch: (data.requireExactMatch === 'yes' && true),
    mccs: undefined,
    tccs: undefined,
    validThrough: validThroughUTCNoon.getTime(),
  };

  const customFields = Object.keys(data).filter((key) => { return key.includes('customField') && data[key]; });
  if (customFields.length) {
    toReturn.customFields = {};
    customFields.forEach((field) => {
      toReturn.customFields[`efs-${field}`] = data[field];
    });
  }

  return toReturn;
}

function _adaptPrivateDataFromAPI(data) {
  return {
    id: data.id,
    ...data.private,
  };
}

function _fetchPrivate(data) {
  return api().get(`/cardsintegration/${data.organizationId}/${data.accountId}/card/${data.cardId}`)
  .then((res) => {
    return _adaptPrivateDataFromAPI(res.data);
  });
}
