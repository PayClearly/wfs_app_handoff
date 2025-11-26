import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import {
  watchCollection, watchSlice, watchForNewItem, watchValuesWithFinalCallback, watchValue, removeListeners,
} from 'store/_utilities/firebaseHelpers';
import PaymentPipelineAPI from 'api/paymentPipeline';
import AttachmentsAPI from 'api/attachments';
import PaymentsAPI from 'api/payments';
import PaymentStatusesAPI from 'api/paymentStatuses';
import FirebaseApi from 'api/firebase';
import numeral from 'numeral';
import Utils from 'utils';

const namespace = 'PAYMENTSTATUSES';
export const actionTypes = createActionTypes(namespace);

// Reducer //
export const defaultState = {
  paths: {},
  items: {},
};

const DEFAULT_COLLECTION_STATE = {
  _oldIds: {},
  batch: {},
  paymentKeys: {},
  fetched: {},
};

export function _moduleReducers(state = defaultState, action) {

  let newState = {};
  let denormalized = {};

  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    case actionTypes.replaceStart:
      return {
        items: {},
        paths: {},
      };
    case actionTypes.fetchSuccess:
      newState = {
        items: { ...state.items, ...action.items },
        paths: { ...state.paths, ...action.paths },
        created: { ...state.created },
      };
      denormalized = _denormalizer(newState);
      return {
        ...newState,
        ...denormalized,
      };

    case actionTypes.initializeSuccess:
      return {
        ...state,
        items: { ...state.items, ...action.items },
        paths: { ...state.paths, ...action.paths },
      };

    case actionTypes.updateSuccess:
      return {
        ...state,
        lastAction: action.action,
      };

    case actionTypes.createSuccess:
      return {
        ...state,
        created: { ...action.data },
      };

    default:
      return state;

  }
}

export function _collectionReducers(state = DEFAULT_COLLECTION_STATE, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...DEFAULT_COLLECTION_STATE };
    case actionTypes.replaceSuccess:
      return { ...state, ...action.collections };
    case actionTypes.initializeSuccess:
      return { ...state, ...action.collections };
    case actionTypes.updateSuccess:
      return { ...state, ...action.collections };
    case actionTypes.fetchSuccess:
      if (!action.isOps) { return Utils.store.collectionHelper(state, action.collections); }
      return { ...state };
    default:
      return state;
  }
}

// denormalizer

function _denormalizer(state) {

  const paymentStatusIds = Object.keys(state.items);
  const paymentsByBatch = {};

  paymentStatusIds.forEach((id) => {
    const batchId = state.items[id]._batchId;
    if (paymentsByBatch[batchId] && paymentsByBatch[batchId].length) {
      paymentsByBatch[batchId].push(id);
    } else {
      paymentsByBatch[batchId] = [id];
    }
  });

  return {
    paymentsByBatch,
  };
}

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
  collections: _collectionReducers,
});

export default reducer;

// action creators
export function initialize(organizationId, accountId) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.initializeStart });
    let first = true;
    watchForNewItem(`state/paymentStatuses/${organizationId}/${accountId}`, {}, (item, paths) => {
      if (first) {
        first = false;
        return Promise.resolve();
      }
      const collections = getState().account.paymentStatuses.collections || DEFAULT_COLLECTION_STATE;
      if (!collections.paymentKeys[`${organizationId}/${accountId}`]) { collections.paymentKeys[`${organizationId}/${accountId}`] = {}; }
      collections.paymentKeys[`${organizationId}/${accountId}`][item._id] = true;
      const adaptedPayment = _adaptFrom({ [item._id]: item });
      dispatch({
        type: actionTypes.updateSuccess, items: adaptedPayment, collections, paths,
      });
    });
    return FirebaseApi.fetchKeys(`default/state/paymentStatuses/${organizationId}/${accountId}`, (items, paths) => {
      const sortedKeys = Object.keys(items)
        .sort()
        .reduce((acc, curr) => {
          acc[curr] = true;
          return acc;
        }, {});
      const collections = getState().account.paymentStatuses.collections || DEFAULT_COLLECTION_STATE;
      if (!collections.paymentKeys[`${organizationId}/${accountId}`]) { collections.paymentKeys[`${organizationId}/${accountId}`] = {}; }
      collections.paymentKeys[`${organizationId}/${accountId}`] = sortedKeys;
      dispatch({ type: actionTypes.initializeSuccess, collections, paths });
    })
      .catch((error) => dispatch({ type: actionTypes.initializeError, error: error.message }));
  };
}

export function initializeFiltered(organizationId, accountId, filters) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.initializeStart });

    const callback = (_items, paths) => {
      const items = _items || [];
      const sortedKeys = (Array.isArray(items) ? items : Object.keys(items))
        .sort();
      const collections = getState().account.paymentStatuses.collections || DEFAULT_COLLECTION_STATE;
      if (!collections.paymentKeys) { collections.paymentKeys = {}; }
      collections.paymentKeys[`${organizationId}/${accountId}`] = sortedKeys;
      dispatch({ type: actionTypes.initializeSuccess, collections, paths });
    };
    try {
      if (!_try(() => Object.keys(filters.filters).length)) {
        return FirebaseApi.fetchKeys(`default/state/paymentStatuses/${organizationId}/${accountId}`, callback);
      }
      return PaymentStatusesAPI.fetchFilteredKeys(organizationId, accountId, filters, callback);
    } catch (error) {
      dispatch({ type: actionTypes.initializeError, error: error.message });
    }
  };
}

export function fetchResource(organizationId, accountId, resourceId) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    watchValue(`state/paymentStatuses/${organizationId}/${accountId}/${resourceId}`, (item, paths) => {

      const adaptedItems = _adaptFrom({ [resourceId]: item });

      const collections = Object.keys(adaptedItems).reduce((acc, id) => {
        const adaptItem = adaptedItems[id];
        acc.batch[adaptItem._batchId] = acc.batch[adaptItem._batchId] ? [...acc.batch[adaptItem._batchId], id] : [id];
        if (!acc.fetched[`${organizationId}/${accountId}`]) { acc.fetched[`${organizationId}/${accountId}`] = {}; }
        acc.fetched[`${organizationId}/${accountId}`][adaptItem._id] = true;
        if (id === adaptItem._oldId) { return acc; }
        acc._oldIds[adaptItem._oldId] = acc._oldIds[adaptItem._oldId] ? [...acc._oldIds[adaptItem._oldId], id] : [id];
        return acc;
      }, getState().account.paymentStatuses.collections ? getState().account.paymentStatuses.collections : DEFAULT_COLLECTION_STATE);
      dispatch({
        type: actionTypes.fetchSuccess, items: adaptedItems, paths, collections,
      });
    });
  };
}

//         acc.batch[item._batchId] = acc.batch[item._batchId] ? [...acc.batch[item._batchId], id] : [id];
//         acc._oldIds[item._oldId] = acc._oldIds[item._oldId] ? [...acc._oldIds[item._oldId], id] : [id];
//         acc._oldIds[item._oldId] = acc._oldIds[item._oldId] ? [...acc._oldIds[item._oldId], id] : [id];

export function fetchPayments(organizationId, accountId, paymentIds) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.replaceStart });
    removeListeners(getState().account.paymentStatuses.data.items);
    const collections = getState().account.paymentStatuses.collections || DEFAULT_COLLECTION_STATE;

    const callback = (item, paths) => {
      const adaptedItem = _adaptFrom(item);
      const [payment, id] = Object.entries(adaptedItem)[0];
      collections.batch[payment._batchId] = collections.batch[payment._batchId] ? [...collections.batch[payment._batchId], id] : [id];
      if (payment._oldId !== id) { collections._oldIds[payment._oldId] = collections._oldIds[payment._oldId] ? [...collections._oldIds[payment._oldId], id] : [id]; }
      dispatch({
        type: actionTypes.fetchSuccess, items: adaptedItem, isOps: true, paths,
      });
    };

    const finalCallback = () => dispatch({ type: actionTypes.replaceSuccess, collections });

    return watchValuesWithFinalCallback(`state/paymentStatuses/${organizationId}/${accountId}`, paymentIds, callback, finalCallback);
  };
}
//   (item, path) => {
//   (items, paths) => {
//       acc.batch[payment._batchId] = acc.batch[payment._batchId] ? [...acc.batch[payment._batchId], id] : [id];
//       acc._oldIds[payment._oldId] = acc._oldIds[payment._oldId] ? [...acc._oldIds[payment._oldId], id] : [id];

export function sync(organizationId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchCollection(`state/paymentStatuses/${organizationId}/${accountId}`, (items, paths) => {
      const adaptedItems = _adaptFrom(items);
      const collections = Object.keys(adaptedItems).reduce((acc, id) => {
        const item = adaptedItems[id];
        acc.batch[item._batchId] = acc.batch[item._batchId] ? [...acc.batch[item._batchId], id] : [id];
        if (id === item._oldId) { return acc; }
        acc._oldIds[item._oldId] = acc._oldIds[item._oldId] ? [...acc._oldIds[item._oldId], id] : [id];
        return acc;
      }, DEFAULT_COLLECTION_STATE);
      dispatch({
        type: actionTypes.fetchSuccess, items: adaptedItems, paths, collections,
      });
    });
  };
}

export function fetchPaymentsWithIds(organizationId, accountId, start, end) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchSlice(
      `state/paymentStatuses/${organizationId}/${accountId}`,
      { start, end },
      (items, paths) => {
        const adaptedItems = _adaptFrom(items);
        const collections = Object.keys(adaptedItems).reduce((acc, id) => {
          const item = adaptedItems[id];
          acc.batch[item._batchId] = acc.batch[item._batchId] ? [...acc.batch[item._batchId], id] : [id];
          if (id === item._oldId) { return acc; }
          acc._oldIds[item._oldId] = acc._oldIds[item._oldId] ? [...acc._oldIds[item._oldId], id] : [id];
          return acc;
        }, getState().account.paymentStatuses.collections ? getState().account.paymentStatuses.collections : DEFAULT_COLLECTION_STATE);
        dispatch({
          type: actionTypes.fetchSuccess, items: adaptedItems, paths, collections,
        });
      }
    );
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.paymentStatuses.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

export function create(organizationId, accountId, payments, acceptedFile) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return PaymentsAPI.create(organizationId, accountId, { payments, acceptedFile })
      .then((res) => {
        dispatch({ type: actionTypes.createSuccess, data: res.data });
        return res.data.payments;
      })
      .catch((error) => {
        dispatch({ type: actionTypes.createError, error: error.response.data.error });
      });
  };
}

export function createWithText(organizationId, accountId, { textPayments, paymentUploadId, contentType }) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return PaymentsAPI.createWithText(organizationId, accountId, { payments: textPayments, paymentUploadId, contentType })
      .then((res) => {
        dispatch({ type: actionTypes.createSuccess, data: res.data });
        return res.data.payments;
      })
      .catch((error) => {
        dispatch({ type: actionTypes.createError, error: error.response.data.error });
      });
  };
}

export function update(organizationId, accountId, ids, action, params = {}) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    if (action === 'sendPaymentForm') {
      return PaymentPipelineAPI.update(organizationId, accountId, { ids, action })
        .then(() => {
          dispatch({ type: actionTypes.updateSuccess });
        })
        .catch((error) => {
          if (!error?.response?.data?.error) {
            console.error('sendPaymentForm', error);
          }
          dispatch({ type: actionTypes.updateError, error: error?.response?.data?.error || 'Unknown Error' });
        });
    }
    if ((action === 'markAsSent' || action === 'uploadReceipt') && params.receipts && params.receipts.length && ids.length === 1) {

      const storagePath = `attachments/paymentStatuses/${organizationId}/${accountId}/${ids[0]}/sent`;
      return AttachmentsAPI.create(params.receipts, storagePath)
        .then((response) => {
          const data = {
            ids,
            action,
            receipts: response.data.attachments,
          };

          // handles pre-existing receipts in the case of the uploadReceipt action
          if (params.existingReceipts && params.existingReceipts.length) {
            data.receipts = [...params.existingReceipts, ...response.data.attachments];
          }
          return PaymentPipelineAPI.update(organizationId, accountId, data);
        })
        .then((data) => {
          dispatch({ type: actionTypes.updateSuccess, data });
        })
        .catch((error) => {
          if (!error?.response?.data?.error) {
            console.error('markAsSent or uploadReceipt', error);
          }
          dispatch({ type: actionTypes.updateError, error: error?.response?.data?.error || 'Unknown Error' });
        });
    }
    if (action === 'attachPaymentForm' && params.attachedPaymentForm && ids.length === 1) {

      const storagePath = `attachments/paymentStatuses/${organizationId}/${accountId}/${ids[0]}/sent`;
      return AttachmentsAPI.create([params.attachedPaymentForm], storagePath)
        .then((response) => {
          const data = {
            ids,
            action,
            attachedPaymentForm: response.data.attachments,
          };
          return PaymentPipelineAPI.update(organizationId, accountId, data);
        })
        .then((data) => {
          dispatch({ type: actionTypes.updateSuccess, data });
        })
        .catch((error) => {
          if (!error?.response?.data?.error) {
            console.error('attachPaymentForm', error);
          }
          dispatch({ type: actionTypes.updateError, error: error?.response?.data?.error || 'Unknown Error' });
        });
    }
    if (action === 'removeReceipt' && ids.length === 1 && (params.receiptKey || params.receiptKey === 0) && params.existingReceipts) {

      const currentReceipts = [...params.existingReceipts];
      const editedReceipts = currentReceipts.slice(0, params.receiptKey).concat(currentReceipts.slice(params.receiptKey + 1));

      const data = {
        ids,
        action,
        receipts: editedReceipts,
      };

      return PaymentPipelineAPI.update(organizationId, accountId, data)
        .then((response) => {
          dispatch({ type: actionTypes.updateSuccess, data: response });
        })
        .catch((error) => {
          if (!error?.response?.data?.error) {
            console.error('removeReceipt', error);
          }
          dispatch({ type: actionTypes.updateError, error: error?.response?.data?.error || 'Unknown Error' });
        });
    }
    if (action === 'updatePayAt' && ids && (params.payAt)) {

      const data = {
        ids,
        action,
        payAt: params.payAt,
      };
      return PaymentPipelineAPI.update(organizationId, accountId, data)
        .then((response) => {
          dispatch({ type: actionTypes.updateSuccess, data: response });
        })
        .catch((error) => {
          if (!error?.response?.data?.error) {
            console.error('updatePayAt', error);
          }
          dispatch({ type: actionTypes.updateError, error: error?.response?.data?.error || 'Unknown Error' });
        });
    }
    if (action === 'updateVendorRemittanceFields' && ids && params) {
      // we only update one at a time
      const paymentId = ids[0];
      return PaymentPipelineAPI.updateVendorRemittanceFields(organizationId, accountId, paymentId, params)
        .then((response) => {
          dispatch({ type: actionTypes.updateSuccess, data: response });
        })
        .catch((error) => {
          if (!error?.response?.data?.error) {
            console.error('updateVendorRemittanceFields', error);
          }
          dispatch({ type: actionTypes.updateError, error: error?.response?.data?.error || 'Unknown Error' });
        });
    }

    return PaymentPipelineAPI.update(organizationId, accountId, { ids, action, ...params })
      .then((data) => {
        dispatch({ type: actionTypes.updateSuccess, data, action });
      })
      .catch((error) => {
        if (!error?.response?.data?.error) {
          console.error('update paymentStatus', error);
        }
        dispatch({ type: actionTypes.updateError, error: error?.response?.data?.error || 'Unknown Error' });
      });
  };
}

function _adaptFrom(items) {
  return Object.keys(items || {})
    .reduce((acc, pushId) => {
      const item = items[pushId];
      const statusDetails = _pipelineStatusDetails(item);
      // filter out invalid receipts from the sent step
      if (item && item.sent && item.sent.receipts && item.sent.receipts.length) {
        item.sent.receipts = item.sent.receipts.filter((receipt) => receipt.contentType);
      }
      let issueIds = [];
      if (item._issueIds) {
        issueIds = Object.keys(item._issueIds);
      }
      acc[pushId] = {
        ...item, status: statusDetails.status, substatus: statusDetails.substatus, statusDetails, _id: pushId, _oldId: item._id, _issueIds: issueIds,
      };
      return acc;
    }, {});
}

function _pipelineStatusDetails(pipelineStatus = {}) {
  const checkagainst = {
    payAt: pipelineStatus.created && pipelineStatus.created.payAt,
    createdAt: pipelineStatus.created && pipelineStatus.created._at,
    verifiedAt: pipelineStatus.verified && pipelineStatus.verified._at,
    fundedAt: pipelineStatus.funded && pipelineStatus.funded._at,
    sentAt: pipelineStatus.sent && pipelineStatus.sent._at,
    trackedAt: pipelineStatus.tracked && pipelineStatus.tracked._at,
  };
  const statusDetails = {};
  if (checkagainst.createdAt && !checkagainst.verifiedAt) {
    statusDetails.status = 'Verifying...';
    statusDetails.indexInProgress = 1;
    statusDetails.index = 1;
  } else if (checkagainst.verifiedAt && !checkagainst.fundedAt) {
    statusDetails.status = 'Funding...';
    statusDetails.indexInProgress = 2;
    statusDetails.index = 2;
  } else if (checkagainst.fundedAt && !checkagainst.sentAt) {
    statusDetails.status = 'Processing...';
    statusDetails.indexInProgress = 3;
    statusDetails.index = 3;
  } else if (checkagainst.sentAt && !checkagainst.trackedAt) {
    statusDetails.status = 'Tracking...';
    statusDetails.indexInProgress = 4;
    statusDetails.index = 4;
  } else if (checkagainst.trackedAt) {
    statusDetails.status = 'Complete';
    statusDetails.indexInProgress = 5;
    statusDetails.index = 4;
  } else if (checkagainst.payAt > Date.now()) {
    statusDetails.status = 'Scheduled';
    statusDetails.index = -1;
  } else {
    statusDetails.status = _try(() => pipelineStatus.created.requiresApproval) ? 'Needs Approval' : 'Pending...';
    statusDetails.indexInProgress = 0;
    statusDetails.index = 0;
  }

  // determine the substatus

  if (pipelineStatus._status === 'tracked') {
    const trackedStep = pipelineStatus.tracked || {};
    if (trackedStep.unused) {
      statusDetails.substatus = `Complete: ${numeral(trackedStep.unused).format('$0,0.00')} remaining`;
    }
  }
  if (pipelineStatus._status === 'tracking') {
    const trackedStep = pipelineStatus.tracked || {};
    if (trackedStep.unused) {
      statusDetails.substatus = `${numeral(trackedStep.unused).format('$0,0.00')} remaining`;
    }
    if (!trackedStep.unused) {
      statusDetails.substatus = 'Awaiting Activity';
    }
  }
  if (pipelineStatus._status === 'creating' && statusDetails.status === 'Scheduled') {
    statusDetails.substatus = Utils.dates.dateToDay(pipelineStatus.created.payAt);
  }

  return statusDetails;
}
