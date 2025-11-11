/* eslint no-undef:0 */
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';
import { getItemsByContext } from '../_utils';
import {
  convertDates,
  createParams,
  createFetchParams,
  createCollections,
  updateCollections,
  parseData,
} from '../_utils/documents';
import query from './query';

const namespace = 'WFS_SALES_ORDERS';
const DOCUMENT_TYPE = 'salesOrders';
const DEFAULT_DATA_STATE = {};
const DEFAULT_COLLECTION_STATE = {
  icaoInfo: {
    // ICAO: { initialized: false, updated: false, newest: [], newestFetchCount: 0, oldest: [], oldestFetchCount: 0  },
  },
  lastUsedIcao: '',
};

// Helper functions
function createDataReduceCallback(icao) {
  return function dataReduceCallback(acc, curr) {
    const doc = { ...curr };
    doc._id = curr.orderNumber;
    acc[icao][curr.orderNumber] = doc;
    return acc;
  };
}

function _indexBy(node) {
  return node.orderNumber;
}

export const actionTypes = createActionTypes(namespace);
export function _moduleReducers(state = DEFAULT_DATA_STATE, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...DEFAULT_DATA_STATE };
    case actionTypes.initializeSuccess:
    case actionTypes.fetchSuccess:
      return { ...state, ...action.data };
    default:
      return state;
  }
}

export function _collectionReducers(state = DEFAULT_COLLECTION_STATE, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...DEFAULT_COLLECTION_STATE };
    case actionTypes.initializeSuccess:
    case actionTypes.fetchSuccess:
      return { ...action.collections };
    default:
      return state;
  }
}

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
  collections: _collectionReducers,
});

export default reducer;

export function sync({ icao, dateOrder, toDate, fromDate }) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.initializeStart });
    try {
      const { dateStart, dateEnd } = convertDates({ type: DOCUMENT_TYPE, toDate, fromDate });

      const { customerNumber, tailNumber } = getState().wfs.data.context;

      const params = createParams({ type: DOCUMENT_TYPE, customerNumber, tailNumber, icao, dateStart, dateEnd, dateOrder });

      const documents = await getItemsByContext(query, params, getState(), _indexBy);

      const data = parseData({ documents, icao, reduceCallback: createDataReduceCallback(icao) });

      const collections = createCollections({ collections: DEFAULT_COLLECTION_STATE, documents, dateOrder, icao });

      return dispatch({
        type: actionTypes.initializeSuccess,
        data,
        collections,
      });
    } catch (err) {
      dispatch({ type: actionTypes.initializeError, error: err.message });
    }
  };
}

export function fetch({ icao, isUpdate, dateOrder, toDate, fromDate }) {
  return async (dispatch, getState) => {
    dispatch({ type: isUpdate ? actionTypes.updateStart : actionTypes.fetchStart });
    try {
      const { dateStart, dateEnd } = convertDates({ type: DOCUMENT_TYPE, toDate, fromDate });

      const { customerNumber, tailNumber } = getState().wfs.data.context;

      const _documents = getState().wfs.salesOrders;

      const params = createFetchParams({ type: DOCUMENT_TYPE, _documents, dateOrder, icao, isUpdate, customerNumber, tailNumber, dateStart, dateEnd });

      const documents = await getItemsByContext(query, params, getState(), _indexBy);

      const data = parseData({ documents, icao, reduceCallback: createDataReduceCallback(icao) });
      // Spread the existing data for the icao and then add the new data
      data[icao] = { ..._documents.data[icao], ...data[icao] };

      const collections = updateCollections({ _documents, documents, dateOrder, icao, isUpdate, first: params.first });

      return dispatch({
        type: isUpdate ? actionTypes.updateSuccess : actionTypes.fetchSuccess,
        data,
        collections,
      });
    } catch (err) {
      dispatch({ type: isUpdate ? actionTypes.updateError : actionTypes.fetchError, error: err.message });
    }
  };
}

export function clear() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clear });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}
