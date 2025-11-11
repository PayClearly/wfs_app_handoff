import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchSlice, removeListeners, getContext } from 'store/_utilities/firebaseHelpers';
import OpsNotesAPI from 'api/opsNotes';

const namespace = 'OPSNOTES';
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

    case actionTypes.fetchSuccess:
      return {
        ...state,
        items: { ...state.items, ...action.items },
        paths: { ...state.paths, ...action.paths },
      };
    case actionTypes.updateSuccess:
      return {
        ...state,
        items: { ...state.items, ...action.items },
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

export default reducer;

// action creators
export function sync(organizationId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return Promise.all([
      watchSlice('state/opsNotes', { parameter: 'context', start: `achTransfers/${organizationId}/${accountId}/`, end: `achTransfers/${organizationId}/${accountId}/\uf8ff` }, (items, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, items, paths });
      }), 
      watchSlice('state/opsNotes', { parameter: 'context', start: `paymentStatuses/${organizationId}/${accountId}/`, end: `paymentStatuses/${organizationId}/${accountId}/\uf8ff` }, (items, paths) => {
      dispatch({ type: actionTypes.updateSuccess, items, paths }); // used actionType.updateSuccess to distinguish status between payments and achTransfers
      }),
    ]);
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.opsNotes.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

// action creators
export function fetchNotesFromContext(context) {
  return (dispatch) => {
    const parsedContext = buildContext(context);
    dispatch({ type: actionTypes.fetchStart });
    return getContext('state/opsNotes/', (items) => {
      dispatch({ type: actionTypes.fetchSuccess, items });
    }, { context: parsedContext });
  };
}

function buildContext(context) {
  let parsedContext = context.nodeType;
  if (context.organizationId) {
    parsedContext += `/${context.organizationId}`;
    if (context.accountId) {
      parsedContext += `/${context.accountId}`;
      if (context.resourceId) {
        parsedContext += `/${context.resourceId}`;
      }
    }
  }
  return parsedContext;
}

export function create(context, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return OpsNotesAPI.create(context, data)
      .then(() => {
        dispatch({ type: actionTypes.createSuccess });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.createError, error: error.response.data.error });
      });
  };
}

//     dispatch({ type: actionTypes.updateStart });
//     .then(() => {
//     })
//     .then(() => {
//       dispatch({ type: actionTypes.updateSuccess });
//     })
//     .catch((error) => {
//       dispatch({ type: actionTypes.updateError, error: error.response.data.error });
//     });
//   };
// }
