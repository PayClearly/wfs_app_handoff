import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchSlice, removeListeners } from 'store/_utilities/firebaseHelpers';

import PaymentsAPI from 'api/paymentPipeline';

const namespace = 'OPSPAYMENTS';
export const actionTypes = createActionTypes(namespace);

export const defaultState = {
  paths: {},
  items: {},
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    case actionTypes.fetchSuccess:
      return {
        ...state,
        items: { ...action.data },
        paths: { ...state.paths, ...action.paths },
      };

    default:
      return state;

  }
}

export const reducer = combineReducers({
  status: createStatusReducer(namespace),
  data: _moduleReducers,
});
export function sync(params) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    const queryPriority = [{
      parameter: 'cardNumberLastFour',
      type: 'string',
    }, {
      parameter: 'amount',
      type: 'number',
    }, {
      parameter: 'account',
      type: 'string',
    }, {
      parameter: 'status',
      type: 'string',
    }, {
      parameter: 'organization',
      type: 'string',
    }, {
      parameter: 'method',
      type: 'string',
    }, {
      parameter: 'vendorName',
      type: 'string',
    }];
    // createdAt
    // id

    const query = queryPriority.reduce((acc, { parameter, type }) => {
      if (params[parameter] && !acc.parameter) {
        acc = {
          parameter,
          parameterValue: type === 'number' ? Number(params[parameter]) : params[parameter],
        };
      }
      return acc;
    }, {});
    
    return watchSlice('denormalized/payments', query, (items, paths) => {
      const isMultiQuery = Object.keys(params).length > 1;
      const toReturn = isMultiQuery ? Object.keys(items).reduce((acc, id) => {
        if (Object.keys(params).every(parameter => items[id][parameter] == params[parameter])) acc[id] = items[id];
        return acc;
      }, {}) : items;
      
      dispatch({ type: actionTypes.fetchSuccess, data: toReturn }); 
    });
  }
}

export default reducer;

function parseData(items, accounts, organizations) {
  if(!organizations) return {}
  const data = Object.keys(items).reduce((acc, curr) => {
    const { vendorName, ...rest } = items[curr];
    const [name, displayName] = vendorName.split('::');
    acc[curr] = { ...rest, vendorName: (displayName && displayName !== name && `${displayName} (${name})`) || name };
    return acc;
  }, {});
  return data;
}
