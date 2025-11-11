import { combineReducers } from 'redux';

import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import botAPI from 'api/taikoBots';

/**
 * @typedef {import('./types').Botworker} Botworker
 * @typedef {import('./types').BotworkerUpdate} BotworkerUpdate
 */

const namespace = 'GLOBALBOTWORKERS';

const actionTypes = createActionTypes(namespace);

const defaultState = {
  items: [],
};

/**
 * 
 * @param {Botworker[]} items 
 * @param {BotworkerUpdate} itemToUpdate 
 * @returns {Botworker[]}
 */
const updateItems = (items, itemToUpdate) => (
  items.map((item) => {
    if (item._id === itemToUpdate.id) {
      return { ...item, ...itemToUpdate };
    }
    
    return item;
  })
);

const moduleReducers = (state = defaultState, action) => {
  switch (action.type) {
    case actionTypes.clear:
      return { ...defaultState };
    case actionTypes.fetchSuccess:
      return { ...state, items: action.data };
    case actionTypes.updateSuccess:
      return { ...state, items: updateItems(state.items, action.data) };   
    default:
      return state;
  }
};

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: moduleReducers,
});

export function sync() {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });

    return botAPI.fetchBotWorkers().then((data) => {
      dispatch({ type: actionTypes.fetchSuccess, data });
    }).catch((error) => {
      dispatch({ type: actionTypes.fetchError, error: error.response.data.error });
    });
  };
}

/**
 * 
 * @param {BotworkerUpdate} data 
 * @returns {Promise<void>}
 */
export function update(data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });

    return botAPI.updateBotWorker(data).then(() => {
      dispatch({ type: actionTypes.updateSuccess, data });
    }).catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export default reducer;
