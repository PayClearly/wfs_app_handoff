import { createSelector, createSelectorCreator, defaultMemoize } from 'reselect';

window.selectorLog = {};

const watchedEqualityCheck = (previousVal, currentVal) => {
  const equal = currentVal === previousVal;
  if (!equal && window.GLOBALCERT.projectId === 'TEST-ENV_CHANGE-ME') console.log(previousVal, 'was not equal to current value', currentVal);
  return equal;
};
const createWatchedSelector = createSelectorCreator(defaultMemoize, watchedEqualityCheck);

function selectorWrapper(...args) {

  const name = typeof args[0] === 'string' && args[0] || false;

  const states = args.slice(name && 1 || 0, -1).map(state => inputSelectorWrapper(state, name || 'unnamed'));
  const selector = args[args.length - 1];

  const _wrapped = (...params) => {
    const start = Date.now();
    const toReturn = selector(...params);
    const took = Date.now() - start;
    if (took > 1000 && window.GLOBALCERT.projectId === 'TEST-ENV_CHANGE-ME') console.log(`--- (${name || 'unnamed'}) took ${took}ms`);
    window.selectorLog[name || 'unnamed'] = window.selectorLog[name || 'unnamed'] ? window.selectorLog[name || 'unnamed'] + 1 : 1;

    return toReturn;
  };

  const watched = name && name.includes('watched');
  if (watched) return createWatchedSelector(...states, _wrapped);
  return createSelector(...states, _wrapped);
}

const inputSelectorWrapper = (inputSelector, name) => {
  // return (...props) => _try(() => inputSelector(...props), name);
  return (...props) => {
    try {
      return inputSelector(...props);
    } catch (e) {
      return undefined;
    }
  };
};

export default selectorWrapper;

