import { timespanToDate } from "../index.js";
// These are helper functions for the three document types: 'serviceProviderDocuments', 'salesOrders', and 'openFuelAuthorizations'

// Use this const to define the number of document fetched at a time
const FETCH_COUNT = 7;

/**
 * @typedef {Object} DateRange
 * @property {string | null} dateStart - The start date of the date range
 * @property {string | null} dateEnd - The end date of the date range 
*/
/**
 * Returns dateStart and dateEnd in an object based on the type of document, the toDate, and fromDate.
 * @param {Object} DateInputs
 * @param {string} DateInputs.type (example: 'serviceProviderDocuments' or 'salesOrders' or 'openFuelAuthorizations')
 * @param {string} DateInputs.toDate (example: 'today' or '1d' or '30d' or '2w' or '3m' or '1y')
 * @param {string} DateInputs.fromDate (example: 'today' or '1d' or '30d' or '2w' or '3m' or '1y')
 * @returns {DateRange} (example: { dateStart: '2021-08-01', dateEnd: '2021-08-31' })
 *
 * @example
 * - Current date is '2021-08-02'
 * convertDates({ type: 'serviceProviderDocuments', toDate: 'today', fromDate: '1d' })
 * returns { dateStart: '2021-08-03', dateEnd: '2021-08-02' }
*/
// TODO Clean up this toDate, fromDate, startDate, endDate. Confusing terms
// TODO dateOrder should not be used, it should be using direction to determine if the date is in the future or past
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
      // If we're fetching all documents up to today, then we don't need a dateStart
      dateStart = fromDate !== "All" ? timespanToDate(fromDate, pastDate) : null;
      break;
    case 'salesOrders':
      // Will always have a date range to fetch by
      dateEnd = timespanToDate(toDate, futureDate);
      dateStart = timespanToDate(fromDate, pastDate);
      break;
    case 'openFuelAuthorizations':
      // If a date range is selected, then use it
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
/**
 * @typedef {Object} ParameterInputs
 * @property {string} ParameterInputs.type (example: 'serviceProviderDocuments' or 'salesOrders' or 'openFuelAuthorizations')
 * @property {number} ParameterInputs.customerNumber
 * @property {string} ParameterInputs.tailNumber
 * @property {string | null} [ParameterInputs.icao=null] Service Provider Documents don't require an icao
 * @property {string | null} ParameterInputs.dateStart (example: '2021-08-01')
 * @property {string | null} ParameterInputs.dateEnd (example: '2021-08-31')
 * @property {string} ParameterInputs.dateOrder (example: 'ASC' or 'DESC')
 * @property {boolean} [ParameterInputs.isUpdate=false] (example: true or false)
 * @property {number} [ParameterInputs.first=FETCH_COUNT] (example: 7)
 * @property {string | null} [ParameterInputs.after=null] (example: 'YXJyYXljb25uZWN0aW9uOjA=')
*/
/**
 * Returns the parameters for the GraphQL query based on the type of document, the toDate, fromDate, dateOrder, isUpdate?, first?, and after?
 * @param {ParameterInputs} ParameterInputs
 * @returns {Object | undefined} GraphQL query parameters
 * @example
 * createParams({
 *  type: 'serviceProviderDocuments',
 *  customerNumber: 123456,
 *  tailNumber: 'N12345',
 *  dateStart: '2021-08-01',
 *  dateEnd: '2021-08-31',
 *  dateOrder: 'ASC'
 * })
*/
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
      // Return 'undefined' so it can be handled in the calling function
      break;
  }

  return params;
}

/**
 * @typedef {Object} FetchParameterInputs
 * @extends ParameterInputs
 * @property {Object} _documents
 */

/**
 * Returns the parameters for the GraphQL query by calling createParams based on the type of document, the toDate, fromDate, dateOrder, isUpdate, and calculated first and after
 * @param {FetchParameterInputs} FetchParameterInputs 
 * @returns {Object | undefined} GraphQL query parameters
 * @example
 * createFetchParams({
 *  type: 'serviceProviderDocuments',
 *  _documents: { collections: { icaoInfo: { icao: { newest: ['123', '456'], oldest: ['789'] } } } },
 *  dateOrder: 'ASC',
 *  icao: '123',
 *  isUpdate: false,
 *  customerNumber: '123456',
 *  tailNumber: 'N12345',
 *  dateStart: '2021-08-01',
 *  dateEnd: '2021-08-31'
 * })
*/
export function createFetchParams({ type, _documents, dateOrder, icao, isUpdate, customerNumber, tailNumber, dateStart, dateEnd }) {
  const icaoInfo = _documents.collections.icaoInfo[icao];
  // Get the last entry in the newest or oldest array, depending on the dateOrder
  const lastEntryKey = dateOrder === 'DESC' ? icaoInfo.newest[icaoInfo.newest.length - 1] : icaoInfo.oldest[icaoInfo.oldest.length - 1];
  const lastEntry = _documents.data[icao][lastEntryKey];
  // Get the cursor from the last entry, or set it to null if there is no last entry
  const after = lastEntry !== undefined ? lastEntry.cursor : null;
  // Set the first parameter to the newestFetchCount or oldestFetchCount if isUpdate is true, otherwise set it to FETCH_COUNT
  // This is because we want to fetch the same number of documents as the last fetch to check for updates
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

/**
 * Returns the parsed data based on the documents, icao, and reduceCallback.
 * - data[icao] will default to an empty object if not already defined
 *
 * @param {DataParsingInputs} DataParsingInputs 
 * @returns {Object} The parsed data
 *
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
    // If we're not fetching, then we're initializing
    // TODO Support receiving unique documents and populated newest or oldest to remove duplicated code
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
    // TODO Allow unique documents to be passed to createCollections to remove similar code below
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
    // If we're updating, then we need to check if the documents returned are different than the last fetch
    const updatedIds = documents.map((doc) => doc.documentId);
    if (updatedIds.length) {
      // If there are updated documents, then we need to check if they are already in the current list
      const { newest: _newest, oldest: _oldest } = _documents.collections.icaoInfo[icao];
      const currentIds = dateOrder === 'DESC' ? _newest : _oldest;
      let j = 0;
      for (let i = 0; i < first; i += 1) {
        // If the updated document is not in the current list, then we need to update
        if (updatedIds[i] && updatedIds[i] !== currentIds[j] && !currentIds.includes(updatedIds[i])) {
          currentIds.splice(i, 0, updatedIds[i]);
        } else {
          j += 1;
        }
      }
      // If the updatedIds array is longer than the currentIds array, then we need to update by setting updated to false
      if (updatedIds.length > currentIds.length) {
        updated = false;
      }
    }
  }

  return createCollections({ collections, icao, newest, oldest, updated }, true);
}

