import GraphQL from '../../../api/graphQL';

/**
 * @param {string} unit (example: 'd' or 'w' or 'm' or 'y')
 * @returns {int} The number of milliseconds in the unit
 * @example
 * _convertUnitToMs('d') returns 86400000
 *
*/
const _convertUnitToMs = (unit) => {
  switch (unit) {
    case 'd': // 24 hours
      return 86400000;
    case 'w': // 7 days
      return 604800000;
    case 'm': // 30 days, this is a rough estimate of a month, but it is close enough for our purposes
      return 2629800000;
    case 'y': // 365 days, this is a rough estimate of a year, but it is close enough for our purposes
      return 31557600000;
    default:
      return 0;
  }
};

/**
 * @param {string} timespan (example: '1d' or '30d' or '2w' or '3m' or '1y')
 * - Currently supports 'today' as '0d'
 * @returns {int} The number of milliseconds in the timespan
 * @example
 * _convertTimespanToMs('4d') returns 345600000
*/
const _convertTimespanToMs = (timespan) => {
  // TODO Make '0d' be passed from the call, rather than today
  // temporary fix for the 'today' timespan, until corrected in logic
  if (timespan === 'today') {
    timespan = '0d';
  }
  // The timespan parameter is a string in the format (example: '1d' or '30d' or '2w' or '3m' or '1y')
  const value = parseInt(timespan.slice(0, -1), 10);
  const unit = timespan.slice(-1);
  const ms = _convertUnitToMs(unit);
  return ms * value;
};

/**
 * @param {int} year
 * @returns {boolean} true if the year is a leap year, false otherwise
 */
const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

/**
 * @param {string} [timespan=] (example: '0d', or '1d' or '30d' or '2w' or '3m' or '1y'). Defaults to '0d' to get the current date.
 * - Currently supports 'today' as '0d'
 * @param {'future' | 'past'} [direction='future'] (example: 'future' or 'past'). Defaults to 'future' to get the current date plus the timespan.
 * @example
 * timespanToDate('0d') returns '2021-08-02'
 * timespanToDate('1d') returns '2021-08-03'
 * timespanToDate('1d', 'past') returns '2021-08-01'
*/
export const timespanToDate = (timespan = '0d', direction = 'future') => {
  const ms = _convertTimespanToMs(timespan);
  const now = new Date();
  const nowMs = now.getTime();
  const date = new Date(nowMs + (direction === 'future' ? ms : -ms));
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  let day = date.getDate().toString().padStart(2, '0');
  // Javascript Date object handles leap years, but want to add a redundant check to make sure the date is valid
  if (day === '29' && month === '02' && !isLeapYear(year)) {
    month = '03';
    day = '01';
  }
  return `${year}-${month}-${day}`;
};

export const getItemsByContext = async (query, params, state, indexBy) => {
  const { token } = state.wfs.oAuth.data;
  const device = state.device.data;

  const releaseVersion = window.GLOBALCERT.releaseVersion && window.GLOBALCERT.buildKey ? `${window.GLOBALCERT.releaseVersion}:${window.GLOBALCERT.buildKey}` : 'experimental';
  let baseURL = 'https://world-graph-gateway.qa.wfscorp.com/graphql';
  if (window.GLOBALCERT.WFS_TEST_ENV === 'Test') {
    baseURL = 'https://world-graph-gateway.test.wfscorp.com/graphql';
  }
  if (window.GLOBALCERT.projectId === 'PROD_PROJECT_ID_CHANGE-ME') {
    baseURL = 'https://world-graph-gateway.wfscorp.com/graphql';
  }
  const options = {
    headers: {
      'x-wfs-client-name': 'myWorld Wallet',
      'x-wfs-client-version': `${device.platform}-${releaseVersion}`,
    },
    baseURL,
  };

  let _response;
  try {
    _response = await GraphQL(token, options).query(query, params);
  } catch ({ response }) {
    throw new Error(response.message);
  }
  const err = _response.errors;
  if (err && err.length) {
    throw new Error(err[0].message);
  }
  const { data, errors } = _response.data;

  if (errors && errors.length) {
    throw new Error(errors[0].message);
  }
  const key = Object.keys(data)[0];
  const value = data[key];

  return value.edges ? value.edges.reduce((acc, curr) => {
    const { node } = curr;
    if (indexBy) {
      node._id = indexBy(node);
    }
    node.cursor = curr.cursor || null;
    acc.push(node);
    return acc;
  }, []) : value;
};

export const collectionHelper = (currentState, newState) => {
  const state = Object.keys(currentState).reduce((collections, collectionDomain) => {
    const updatedCollection = Object.keys(newState[collectionDomain]).reduce((acc, curr) => {
      acc[curr] = [...(currentState[collectionDomain][curr] || []), ...newState[collectionDomain][curr]].reduce((acc, curr) => {
        if (!acc.includes(curr)) {
          acc.push(curr);
        }
        return acc;
      }, []);
      return acc;
    }, []);
    collections[collectionDomain] = { ...(currentState[collectionDomain] || {}), ...updatedCollection };
    return collections;
  }, {});
  return state;
};
