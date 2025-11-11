
// Third Party Imports ...
import { createSelector } from 'reselect';


window.selectorCache = {};

function utils_cachedSelector(...args) {
  const [namespace, id, ...states] = args;
  const action = states.pop();

  const wrappedStates = states.map(state => _inputSelectorWrapper(state, namespace));

  window.selectorCache[namespace] = window.selectorCache[namespace] || {};
  window.selectorCache[namespace][id] = window.selectorCache[namespace][id] || createSelector(...wrappedStates, action);

  return window.selectorCache[namespace][id];
}

export default utils_cachedSelector;

// Internal Helper Functions ... 
const _inputSelectorWrapper = (inputSelector, name) => {
  return (...props) => {
    try {
      return inputSelector(...props);
    } catch (e) {
      return undefined;
    }
  };
};

