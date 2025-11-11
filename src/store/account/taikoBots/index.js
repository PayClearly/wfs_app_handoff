import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValuesWithFinalCallback, removeListeners } from 'store/_utilities/firebaseHelpers';

import TaikoBotsAPI from 'api/taikoBots';

const namespace = 'TAIKOBOTS';
export const actionTypes = createActionTypes(namespace);

// Reducer //
export const defaultState = {
  paths: {},
  items: {},
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {
    case actionTypes.clear:
      return { ...defaultState };
    case actionTypes.replaceStart:
      return {
        items: {},
        paths: {},
      };
    case actionTypes.fetchSuccess:
      return {
        items: { ...state.items, ...action.items },
        paths: { ...state.paths, ...action.paths },
      };
    case actionTypes.initializeSuccess:
      return {
        ...state,
        items: { ...state.items, ...action.items },
        paths: { ...state.paths, ...action.paths },
      };
    case actionTypes.updateStart:
      return {
        ...state,
      };
    case actionTypes.updateSuccess:
      return {
        ...state,
        lastAction: action.action,
      };
    default:
      return state;
  }
}


export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
});

export default reducer;

// action creators

/**
 * Used to lazy load whichever Taiko bots are visible in the current view.
 * Fetches Taiko bots by ids, putting them in the redux store and attaching listeners to them,
 * and replacing any Taiko bots currently in the redux store.
 * Once all are successfully fetched, sets the replaceSuccess flag in the store.
 * 
 * @param {string[]} ids 
 * @returns {Promise<void>}
 */
export function fetchTaikoBots(ids) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.replaceStart });
    removeListeners(getState().account.taikoBots.data.items);

    const callback = (items, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, items, paths });
    };

    const { collections } = getState().account.taikoBots;
    const finalCallback = () => dispatch({ type: actionTypes.replaceSuccess, collections });

    return watchValuesWithFinalCallback('state/taiko/bots', ids, callback, finalCallback);
  };
}

/**
 * @typedef {Object} botUpdator
 * @property {string} id
 * @property {string} status
 */

/**
 * Used to update the 'status' property of a single Taiko bot.
 * Calls the Taiko bots api.
 * 
 * @param {botUpdator}
 * @returns {Promise<void>}
 */
export function updateTaikoBotStatus({ id, status }) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });

    try {
      return TaikoBotsAPI.updateTaikoBot(id, { status }).then(() => {
        return dispatch({ type: actionTypes.updateSuccess });
      });
    } catch (error) {
      dispatch({ type: actionTypes.updateError, error: error.message });
    }
  };
}

/**
 * Used to update many Taiko bots' statuses at once.
 * Calls the Taiko bots api.
 * 
 * @param {botUpdator[]} updators 
 * @returns 
 */
export function updateTaikoBotsByIds(updators) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });

    try {
      return TaikoBotsAPI.updateTaikoBotsByIds(updators).then(() => {
        return dispatch({ type: actionTypes.updateSuccess });
      });
    } catch (error) {
      dispatch({ type: actionTypes.updateError, error: error.message });
    }
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.taikoBots.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}
