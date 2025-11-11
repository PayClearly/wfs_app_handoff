/* eslint no-undef:0 */
import { createActionTypes, createStatusReducer } from 'store/_utilities/statusReducerFactory';
import { combineReducers } from 'redux';
import { BiometricsAPI } from 'api/device';

import Utils from 'utils';

import * as device from 'store/device';
import * as account from 'store/account';
import * as organization from 'store/organization';

import * as cards from 'store/wfs/cards';
import * as oAuth from 'store/wfs/oAuth';
import * as tails from 'store/wfs/tails';
import * as trips from 'store/wfs/trips';
import * as facilities from 'store/wfs/facilities';
import * as airports from 'store/wfs/airports';
import * as customers from 'store/wfs/customers';
import * as customerRewards from 'store/wfs/customerRewards';
import * as memberRewards from 'store/wfs/memberRewards';
import * as preferences from 'store/wfs/preferences';
import * as biometrics from 'store/device/biometrics';
import * as serviceProviderDocuments from 'store/wfs/serviceProviderDocuments';
import * as salesOrders from 'store/wfs/salesOrders';
import * as openFuelAuthorizations from 'store/wfs/openFuelAuthorizations';
import * as pdfs from 'store/wfs/pdfs';
import * as airportsGeolocation from 'store/wfs/airportsGeolocation';
import * as airportsSearch from 'store/wfs/airportsSearch';
import * as adhocTrips from 'store/wfs/adhocTrips';

import { BackgroundTask } from '@capawesome/capacitor-background-task';
import BiometricCheck from '../../utils/plugins/BiometricCheck';
import photoGallery from '../../utils/photoGallery';

const namespace = 'WFS';

const DEFAULT_STATE = {
  context: {},
};

export const actionTypes = createActionTypes(namespace);

export function _moduleReducers(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...DEFAULT_STATE };
    case actionTypes.initializeSuccess:
    case actionTypes.updateStart:
      return { ...state, ...action.data };
    case actionTypes.updateSuccess:
      return { ...state, ...action.data };
    case actionTypes.createSuccess:
      return { ...state, ...action.data };
    default:
      return state;
  }
}

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
  oAuth: oAuth.reducer,
  tails: tails.reducer,
  trips: trips.reducer,
  cards: cards.reducer,
  facilities: facilities.reducer,
  airports: airports.reducer,
  airportsGeolocation: airportsGeolocation.reducer,
  airportsSearch: airportsSearch.reducer,
  customers: customers.reducer,
  customerRewards: customerRewards.reducer,
  memberRewards: memberRewards.reducer,
  preferences: preferences.reducer,
  pdfs: pdfs.reducer,
  salesOrders: salesOrders.reducer,
  openFuelAuthorizations: openFuelAuthorizations.reducer,
  serviceProviderDocuments: serviceProviderDocuments.reducer,
  adhocTrips: adhocTrips.reducer,
});

export default reducer;

export function sync(event) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.initializeStart });
    try {
      await oAuth.sync()(dispatch, getState);
      await Promise.all([customers.sync(!!event)(dispatch, getState)]);

      const userPreferences = await preferences.sync()(dispatch, getState);
      const favoriteContext = _resolve(userPreferences, 'favoriteContext', {});
      const lastContext = _try(() => userPreferences.previousContexts[0], {});

      let context = {
        customerNumber: Number(favoriteContext.customerNumber || lastContext.customerNumber),
        tailNumber: favoriteContext.tailNumber || lastContext.tailNumber,
      };
      const customersStore = getState().wfs.customers;
      const customerTailCollectionKeys = Object.keys(customersStore.collections.tailNumbers);
      if (context.customerNumber && context.tailNumber && (customersStore.collections.tailNumbers[context.customerNumber].includes(context.tailNumber))) { await contextSync(context, event)(dispatch, getState); }
      if (customerTailCollectionKeys.length === 1 && customersStore.collections.tailNumbers[customerTailCollectionKeys[0]].length === 1) {
        context = { customerNumber: Number(customerTailCollectionKeys[0]), tailNumber: customersStore.collections.tailNumbers[customerTailCollectionKeys[0]][0] };
        await setContext(context)(dispatch, getState);
      }

      const profileImage = await photoGallery.retrievePhotos(`${getState().user.profile.data.item._id}_profile_image`, (value) => value[0], true);

      dispatch({ type: actionTypes.initializeSuccess, data: { context, profileImage } });
    } catch (err) {
      if (event) { event.detail.complete(); }
      return dispatch({ type: actionTypes.initializeError, error: err.message });
    }
  };
}

export function updateData(data) {
  return async (dispatch) => {
    dispatch({ type: actionTypes.updateStart, data: Object.keys(data).reduce((acc, curr) => { acc[curr] = null; return acc; }, {}) });
    return dispatch({ type: actionTypes.updateSuccess, data });
  };
}

export function setFavoriteContext(context) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });
    try {
      const data = {
        ...getState().wfs.preferences.data,
        favoriteContext: context,
      };
      await preferences.set(data)(dispatch, getState);
      dispatch({ type: actionTypes.updateSuccess });
    } catch (err) {
      if (getState().wfs.preferences.data.errorTracing) {
        // device.showToast({ message: `setFavoriteContext: ${err.message}`, color: 'danger' })(dispatch);
      } else {
        // device.showToast({ message: 'Oops! We just encountered an error, Support has been notified', color: 'danger', duration: 5000 })(dispatch);
      }
      return dispatch({ type: actionTypes.updateError, error: err.message });
    }
  };
}

export function setContext(context) {
  return async (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });
    try {
      const currentContext = getState().wfs.data.context;
      if (Utils.wfsContextMatch(context, currentContext)) {
        return Promise.resolve();
      }

      let data;
      if (context) {
        const previousContexts = _try(() => getState().wfs.preferences.data.previousContexts.filter((previousContext) => !Utils.wfsContextMatch(previousContext, context) && Utils.wfsContextAvailable(previousContext, getState().wfs.customers.collections.tailNumbers)), []);
        previousContexts.unshift(context);

        data = {
          ...getState().wfs.preferences.data,
          previousContexts: previousContexts.slice(0, 5),
        };

      }

      await preferences.set(data || { previousContexts: [] })(dispatch, getState);
      await serviceProviderDocuments.clear()(dispatch);
      await salesOrders.clear()(dispatch);
      await openFuelAuthorizations.clear()(dispatch);
      await adhocTrips.clear()(dispatch, getState);
      await contextSync(context)(dispatch, getState);

      if (!context) {
        context = { customerNumber: null, tailNumber: null };
        account.clear()(dispatch, getState);
        organization.clear()(dispatch, getState);
      } else {
        const accounts = Object.values(store.getState().accounts.data.items).filter((account) => account.externalId.split(':')[0] === `${context.customerNumber}`);
        const accountId = accounts.length === 1 ? accounts[0]._id : '';
        if (accountId) {
          account.sync(accountId)(dispatch, getState);
          syncAdhocTrips(accountId)(dispatch, getState);
        }
      }

      return dispatch({ type: actionTypes.updateSuccess, data: { context } });
    } catch (err) {
      if (getState().wfs.preferences.data.errorTracing) {
        // device.showToast({ message: `setContext: ${err.message}`, color: 'danger' })(dispatch);
      } else {
        // device.showToast({ message: 'Oops! We just encountered an error, Support has been notified', color: 'danger', duration: 5000 })(dispatch);
      }
      return dispatch({ type: actionTypes.updateError, error: err.message });
    }
  };
}

export const syncCustomers = (eventDetail, closeValue, closeModal) => (dispatch, getState) => customers.updateSync(true, setContext, eventDetail, closeValue, closeModal)(dispatch, getState);

export const refreshToken = (callback) => (dispatch, getState) => oAuth.refresh(callback)(dispatch, getState);

export const fetchTrips = (event) => (dispatch, getState) => trips.fetch(event)(dispatch, getState);

export const syncTrips = () => (dispatch, getState) => trips.sync()(dispatch, getState);

// check to see if this is re rendering every time it runs or if it is smart enough to know no data is different
export const contextSync = (context, event) => async (dispatch, getState) => {
  if (!context) {
    return Promise.all([
      cards.clear()(dispatch),
      customerRewards.clear()(dispatch),
      memberRewards.clear()(dispatch),
      tails.clear()(dispatch),
      trips.clear()(dispatch),
      pdfs.clear()(dispatch),
      adhocTrips.clear()(dispatch, getState),
    ]);
  }
  await Promise.all([
    device.getCurrentLocation()(dispatch, getState),
  ]);
  cards.sync(context)(dispatch, getState);
  trips.sync(context)(dispatch, getState);

  // facilities relies on the icao identifiers returned by trips.
  //   // facilities.sync(context, !!event)(dispatch, getState),
  //   // airports.sync(context, !!event)(dispatch, getState),
  // ]);
  memberRewards.sync(context)(dispatch, getState);

  // closes refresher spinner
  if (event) { event.detail.complete(); }
};
export const setUseBiometrics = (useBiometrics) => async (dispatch, getState) => {
  dispatch({ type: actionTypes.createStart });
  try {
    const data = {
      ...getState().wfs.preferences.data,
      useBiometrics,
    };

    // only should happen when turning on
    if (useBiometrics) {
      const biometricsAPI = await BiometricsAPI(getState().device.biometrics.data.options);
      await biometricsAPI.show({ disableBackup: true });
      await biometrics.setAuthed(true)(dispatch);
      await BiometricCheck.initialize();
    } else {
      try {
        await BiometricCheck.clear();
      } catch (err) {
        // We don't clear on android so catching that unimplemented call
      }
    }

    await preferences.set(data)(dispatch, getState);
    dispatch({ type: actionTypes.createSuccess });
  } catch (err) {
    // console.log('there was an error!!!!!', err)
    // device.showToast({ message: `setUseBiometrics: ${err.message}`, color: 'danger' })(dispatch);
    return dispatch({ type: actionTypes.createError, error: err.message });
  }
};

export const setBiometricsTimeout = (biometricsTimeout) => async (dispatch, getState) => {
  dispatch({ type: actionTypes.updateStart });
  try {
    const data = {
      ...getState().wfs.preferences.data,
      biometricsTimeout,
    };
    await preferences.set(data)(dispatch, getState);
    dispatch({ type: actionTypes.updateSuccess });
  } catch (err) {
    if (getState().wfs.preferences.data.errorTracing) {
      // device.showToast({ message: `setBiometricsTimeout: ${err.message}`, color: 'danger' })(dispatch);
    } else {
      // device.showToast({ message: 'Oops! We just encountered an error, Support has been notified', color: 'danger', duration: 5000 })(dispatch);
    }
    return dispatch({ type: actionTypes.updateError, error: err.message });
  }
};
export const setErrorTracing = (errorTracing) => async (dispatch, getState) => {
  dispatch({ type: actionTypes.updateStart });
  try {
    const data = {
      ...getState().wfs.preferences.data,
      errorTracing,
    };
    await preferences.set(data)(dispatch, getState);
    dispatch({ type: actionTypes.updateSuccess });
  } catch (err) {
    if (getState().wfs.preferences.data.errorTracing) {
      // device.showToast({ message: `setErrorTracing: ${err.message}`, color: 'danger' })(dispatch);
    } else {
      // device.showToast({ message: 'Oops! We just encountered an error, Support has been notified', color: 'danger', duration: 5000 })(dispatch);
    }
    return dispatch({ type: actionTypes.updateError, error: err.message });
  }
};

export function searchAirports(searchString) {
  return async (dispatch, getState) => {
    await airportsSearch.search(searchString)(dispatch, getState);
  };
}

export function getAirport(radius) {
  return async (dispatch, getState) => {
    await airportsGeolocation.sync(radius)(dispatch, getState);
  };
}

export function getCurrentLocation() {
  return async (dispatch, getState) => {
    await device.getCurrentLocation()(dispatch, getState);
  };
}

/**
 * @typedef {Object} SyncDocumentsParameters
 * @property {'salesOrders' | 'serviceProviderDocuments' | 'openFuelAuthorizations'} type - The type of document to fetch
 * @property {string} icao - The icao of the airport to fetch documents for
 * @property {boolean} isUpdate - Whether or not to update the documents
 * @property {'ASC' | 'DESC'} dateOrder - The order to sort the documents by, which collection it goes into
 * @property {string} toDate - The date to fetch documents to
 * @property {string} fromDate - The date to fetch documents from
*/
/**
 * Syncs documents of the specified type
 * @param {SyncDocumentsParameters} param0 - The parameters for the sync
 * @returns
*/
export function syncDocuments({ type, icao, dateOrder, toDate, fromDate }) {
  return async (dispatch, getState) => {
    // Call the appropriate sync function based on the type of document
    switch (type) {
      case 'salesOrders':
        await salesOrders.sync({ icao, dateOrder, toDate, fromDate })(dispatch, getState);
        break;
      case 'openFuelAuthorizations':
        await openFuelAuthorizations.sync({ icao, dateOrder, toDate, fromDate })(dispatch, getState);
        break;
      case 'serviceProviderDocuments':
        await serviceProviderDocuments.sync({ icao, dateOrder, toDate, fromDate })(dispatch, getState);
        break;
      default:
        return null;
    }
  };
}
// TODO come back to isUpdate
/**
 * @typedef {Object} FetchDocumentsParameters
 * @extends SyncDocumentsParams
 * @property {boolean} isUpdate - TODO
 * @property {Event=} event - The event to complete after fetching documents
*/
/**
 * Fetches documents of the specified type
 * - Will complete the event if passed
 * @param {FetchDocumentsParameters} param0 - The parameters for the fetch
 * @returns
*/
export function fetchDocuments({ type, icao, dateOrder, toDate, fromDate, isUpdate, event = false }) {
  return async (dispatch, getState) => {
    // Call the appropriate fetch function based on the type of document
    switch (type) {
      case 'salesOrders':
        await salesOrders.fetch({ icao, isUpdate, dateOrder, toDate, fromDate })(dispatch, getState);
        break;
      case 'openFuelAuthorizations':
        await openFuelAuthorizations.fetch({ icao, isUpdate, dateOrder, toDate, fromDate })(dispatch, getState);
        break;
      case 'serviceProviderDocuments':
        await serviceProviderDocuments.fetch({ icao, isUpdate, dateOrder, toDate, fromDate })(dispatch, getState);
        break;
      default:
        // There was no type passed, this should never happen
        // TODO error handling
        break
    }
    // Currently used by infinite scroll spinner
    if (event) {
      event.target.complete();
    }
  }
}

/**
 * Fetches PDF information of the specified document
 * @param {string} resourceId - The id of the document to fetch
 * @returns
*/
export function getDocumentPDF(resourceId) {
  return async (dispatch, getState) => {
    await pdfs.getDocument(resourceId)(dispatch, getState);
  };
}

export function syncAdhocTrips(accountId) {
  return async (dispatch, getState) => {
    await adhocTrips.sync(getState().organization.data.id, accountId || getState().account.data.id, getState().wfs.data.context.tailNumber)(dispatch, getState);
  };
}

export function createAdhocTrip(data) {
  return async (dispatch, getState) => {
    await adhocTrips.create(getState().organization.data.id, getState().account.data.id, data)(dispatch, getState);
  };
}

export function updateAdhocTrip(id, data) {
  return async (dispatch, getState) => {
    await adhocTrips.update(getState().organization.data.id, getState().account.data.id, id, data)(dispatch, getState);
  };
}

export function clear() {
  return (dispatch, getState) => {
    cards.clear()(dispatch);
    oAuth.clear()(dispatch);
    customerRewards.clear()(dispatch);
    memberRewards.clear()(dispatch);
    tails.clear()(dispatch);
    trips.clear()(dispatch);
    serviceProviderDocuments.clear()(dispatch);
    openFuelAuthorizations.clear()(dispatch);
    salesOrders.clear()(dispatch);
    airportsGeolocation.clear()(dispatch);
    airportsSearch.clear()(dispatch);
    pdfs.clear()(dispatch);
    facilities.clear()(dispatch);
    airports.clear()(dispatch);
    customers.clear()(dispatch);
    preferences.clear()(dispatch);
    adhocTrips.clear()(dispatch, getState);
    dispatch({ type: actionTypes.clear });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

export function validateCache(isActive) {
  return async (dispatch, getState) => {
    const state = getState();
    let timer = _try(() => state.wfs.data.timer);

    if (!isActive) {
      if (timer) { clearInterval(timer); }
      timer = setInterval(() => {
        const taskId = BackgroundTask.beforeExit(async () => {
          const userPreferences = state.wfs.preferences.data;
          const favoriteContext = _resolve(userPreferences, 'favoriteContext', {});
          const lastContext = _try(() => userPreferences.previousContexts[0], {});

          const context = {
            customerNumber: favoriteContext.customerNumber || lastContext.customerNumber,
            tailNumber: favoriteContext.tailNumber || lastContext.tailNumber,
          };
          await contextSync(context)(dispatch, getState);
          return BackgroundTask.finish({ taskId });
        });
      }, 1000 * 60 * 10);
    }
    if (isActive && timer) {
      clearInterval(timer);
      timer = null;
    }
    dispatch({ type: actionTypes.updateSuccess, data: { timer } });
  };
}
