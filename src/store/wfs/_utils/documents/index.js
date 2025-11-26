import { timespanToDate } from "../index.js";
// These are helper functions for the three document types: 'serviceProviderDocuments', 'salesOrders', and 'openFuelAuthorizations'

// Use this const to define the number of document fetched at a time
const FETCH_COUNT = 7;

export function convertDates({ type, toDate, fromDate }) {
  let dateStart = null;
  let dateEnd = null;
  // toDate and fromDate come from logic that changes which points to today based on the dateOrder
  // Currently default dateEnd to add the timespan to today
  // Currently default dateStart to subtract the timespan from today
  // These consts will be passed to the function in the future
  const futureDate = 'future';
  const pastDate = 'past';
  switch (type) {
    case 'serviceProviderDocuments':
      dateEnd = timespanToDate(toDate, futureDate);
      dateStart = fromDate !== "All" ? timespanToDate(fromDate, pastDate) : null;
      break;
    case 'salesOrders':
      // Will always have a date range to fetch by
      dateEnd = timespanToDate(toDate, futureDate);
      dateStart = timespanToDate(fromDate, pastDate);
      break;
    case 'openFuelAuthorizations':
      if (toDate !== 'All' && fromDate !== 'All') {
        dateEnd = timespanToDate(toDate, futureDate);
        dateStart = timespanToDate(fromDate, pastDate);
      } else {
        dateEnd = null;
        dateStart = null;
      }
      break;
    default:
      // Handle default case
      break;
  }

  return { dateStart, dateEnd };
}
export function createParams({ type, customerNumber, tailNumber, icao = null, dateStart, dateEnd, dateOrder, isUpdate = false, first = FETCH_COUNT, after = null}) {
  let params;

  switch (type) {
    // ! Query Parameter structures as of @today (2023-11-07)
    case 'serviceProviderDocuments':
      params = {
        DocumentInput: {
          customerNumber,
          tailNumber,
          from: dateStart,
          to: dateEnd,
          icao,
        },
        ServiceProviderDocumentOrderByInput: {
          date: dateOrder,
        },
        first: isUpdate ? first : FETCH_COUNT,
        after: isUpdate ? null : after,
      };
      break;
    case 'salesOrders':
      params = {
        SalesOrderInput: {
          customerNumber,
          tailNumbers: [tailNumber],
          icao: [icao],
          startFuelingDate: dateStart,
          endFuelingDate: dateEnd,
        },
        SalesOrderOrderByInput: {
          upliftDate: dateOrder,
        },
        first: isUpdate ? first : FETCH_COUNT,
        after: isUpdate ? null : after,
      };
      break;
    case 'openFuelAuthorizations':
      params = {
        OfaInput: {
          customerNumber,
          tailNumber,
          icao,
          contractStartDate: dateStart,
          contractEndDate: dateEnd,
        },
        OfaOrderByInput: {
          contractStartDate: dateOrder,
        },
        first: isUpdate ? first : FETCH_COUNT,
        after: isUpdate ? null : after,
      };
      break;
    default:
      // There is no default case
      break;
  }

  return params;
}

export function createFetchParams({ type, _documents, dateOrder, icao, isUpdate, customerNumber, tailNumber, dateStart, dateEnd }) {
  const icaoInfo = _documents.collections.icaoInfo[icao];
  // Get the last entry in the newest or oldest array, depending on the dateOrder
  const lastEntryKey = dateOrder === 'DESC' ? icaoInfo.newest[icaoInfo.newest.length - 1] : icaoInfo.oldest[icaoInfo.oldest.length - 1];
  const lastEntry = _documents.data[icao][lastEntryKey];
  // Get the cursor from the last entry, or set it to null if there is no last entry
  const after = lastEntry !== undefined ? lastEntry.cursor : null;
  // Set the first parameter to the newestFetchCount or oldestFetchCount if isUpdate is true, otherwise set it to FETCH_COUNT
  let first = FETCH_COUNT;
  if (isUpdate) {
    first = dateOrder === 'DESC' ? icaoInfo.newestFetchCount : icaoInfo.oldestFetchCount;
  }

  return createParams({ type, customerNumber, tailNumber, icao, dateStart, dateEnd, dateOrder, isUpdate, first, after });
}
/**

 * @typedef {Object} DataParsingInputs

 * @property {Object[]} documents

 * @property {string} icao

 * @property {any} reduceCallback

 */

export function parseData({ documents, icao, reduceCallback }) {
  const data = documents.reduce(reduceCallback, { [icao]: {} });
  return data;
}
/**

 * @typedef {Object} CreateCollectionsInputs

 * @property {Object} collections

 * @property {Object[]=} documents

 * @property {string=} dateOrder

 * @property {string} icao

 * @property {string[]=} newest

 * @property {string[]=} oldest

 * @property {boolean=} updated

 */
/**

 * Returns the collections object based on the collections, documents, dateOrder, icao, newest?, oldest?, and updated?.

 * - fromFetch defaults to false, and is used by updateCollections

 * @param {CreateCollectionsInputs} CreateCollectionsInputs

 * @param {boolean} [fromFetch=]

 * @returns {Object} The collections object

 */
export function createCollections({ collections, documents = [], dateOrder, icao, newest = [], oldest = [], updated = false }, fromFetch = false) {
  if (!fromFetch) {
    const _ids = documents.map((doc) => doc._id);
    switch (dateOrder) {
      case 'ASC':
        oldest = _ids;
        break;
      case 'DESC':
      default:
        newest = _ids;
        break;
    }
  }

  // ! Collection Structure as of @today (2023-11-07)
  // All document types have the same collection structure
  collections.icaoInfo[icao] = {
    initialized: true,
    updated,
    newest,
    newestFetchCount: newest.length,
    oldest,
    oldestFetchCount: oldest.length,
  };
  collections.lastUsedIcao = icao;

  return collections;
}

/**

 * @typedef {Object} UpdateCollectionsInputs

 * @property {Object} _documents

 * @property {Object[]} documents

 * @property {string} dateOrder

 * @property {string} icao

 * @property {boolean} isUpdate

 * @property {number=} first

 */

/**

 * Returns the collections object based on the _documents, documents, dateOrder, icao, isUpdate, and first?.

 * @param {UpdateCollectionsInputs} UpdateCollectionsInputs

 * @returns {Object} The collections object

 */
export function updateCollections({ _documents, documents, dateOrder, icao, isUpdate, first = FETCH_COUNT }) {
  const { collections } = _documents;
  const { newest = [], oldest = [] } = collections.icaoInfo[icao] || {};

  let updated = isUpdate;
  if (!isUpdate) {
    // Filter out documents that are not in the 'newest' list and not already in the 'oldest' list
    const uniqueDocuments = documents.filter((doc) => !newest.includes(doc._id) && !oldest.includes(doc._id));
    // Extract the reference numbers from these unique documents
    const _ids = uniqueDocuments.map((doc) => doc._id);
    // Add the unique reference numbers to the array based on the dateOrder
    switch (dateOrder) {
      case 'ASC':
        oldest.push(..._ids);
        break;
      case 'DESC':
      default:
        newest.push(..._ids);
        break;
    }
  } else {
    const updatedIds = documents.map((doc) => doc.documentId);
    if (updatedIds.length) {
      const { newest: _newest, oldest: _oldest } = _documents.collections.icaoInfo[icao];
      const currentIds = dateOrder === 'DESC' ? _newest : _oldest;
      let j = 0;
      for (let i = 0; i < first; i += 1) {
        if (updatedIds[i] && updatedIds[i] !== currentIds[j] && !currentIds.includes(updatedIds[i])) {
          currentIds.splice(i, 0, updatedIds[i]);
        } else {
          j += 1;
        }
      }
      if (updatedIds.length > currentIds.length) {
        updated = false;
      }
    }
  }

  return createCollections({ collections, icao, newest, oldest, updated }, true);
}

