import { api } from 'api/_util/payclearlyapi';
import Utils from 'utils';

function create(organizationId, accountId, data) {
  return api().post(`/paymentCards/${organizationId}/${accountId}`, { purchaseCards: _adaptArrayToAPI(data) });
}

function update(organizationId, accountId, data, action) {
  return api().patch(`/paymentCards/${organizationId}/${accountId}`, { action, data: _adaptArrayToAPI(data) });
}

const scope = {
  update,
  create,
};

export default scope;

// // _helpers
function _adaptArrayToAPI(data) {
  if (!data) {
    return data;
  }

  const result = data.map((item) => _adaptItemToAPI(item));
  return result;
}

function _adaptItemToAPI(data) {
  if (!data) {
    return data;
  }

  const trigger = (data.trigger)
    ? {
      ...data.trigger,
      min: parseInt(data.trigger.min, 10),
      max: parseInt(data.trigger.max, 10),
    }
    : null;

  let virtualCard = null;
  if (data.virtualCard) {
    // adapt valid through to UTC noon
    const validThroughUTCNoon = _try(() => new Date(data.virtualCard.validThrough));
    // set UTC date to local date, to handle issues at the end of the day where ex: December 12 on East Coast is December 13 at UTC
    // then standardize timestamp to UTC noon
    _try(() => validThroughUTCNoon.setUTCDate(validThroughUTCNoon.getDate()));
    _try(() => validThroughUTCNoon.setUTCHours(12, 0, 0, 0));

    virtualCard = {
      id: data.vCard,
      amount: Number(parseFloat(data.virtualCard.amount).toFixed(2)),
      maxUses: parseInt(data.virtualCard.maxUses, 10),
      region: data.virtualCard.region,
      exactMatch: false,
      validThrough: validThroughUTCNoon.getTime(),
      bin: data.virtualCard.bin,
    };
  }

  if (_try(() => data.virtualCard.status)) {
    virtualCard.status = data.virtualCard.status;
  }

  if (_try(() => data.virtualCard.customFields)) {
    virtualCard.customFields = data.virtualCard.customFields;
  }

  return {
    ...data,
    virtualCard,
    trigger,
  };
}
