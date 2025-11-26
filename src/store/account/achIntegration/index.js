import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, watchValue, removeListeners, watchValues } from 'store/_utilities/firebaseHelpers';
import API_achIntegration from 'api/achIntegration';
import API_integrationManagement from 'api/integrationManagement';

const namespace = 'ACHINTEGRATION';
export const actionTypes = createActionTypes(namespace);

export const defaultState = {
  paths: {},
  resources: {
    transfers: {},
  },
  statuses: {
    transfers: {},
  },
  details: {},
  preferences: {},
  _resources: {},
};

export function _moduleReducers(state = defaultState, action) {
  switch (action.type) {

    case actionTypes.clear:
      return { ...defaultState };

    case actionTypes.link:
      return { ...defaultState };

    case actionTypes.fetchSuccess:
    case actionTypes.updateSuccess:
      return {
        ...state,
        resources: {
          ...state.resources,
          ...(action.resource && { [action.resource]: {
            ...state.resources[action.resource],
            ...action.items,
          } } || {}),
        },
        _resources: {
          ...state._resources,
          ...(action._resource && { [action._resource]: {
            ...state._resources[action._resource],
            ...action.items,
          } } || {}),
        },
        ...(action.name && { [action.name]: {
            ...state.resources[action.resource],
            ...action.items,
          } } || {}),
        paths: { ...state.paths, ...(action.paths || {}) },
      };

    case actionTypes.createSuccess:
      return {
        ...state,
        created: { ...action.data },
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
  const integration = 'achIntegration';
  return (dispatch, getState) => {
    const definition = getState().integrationDefinitions.data.items[integration];
    const isOps = getState().router.app === 'ops';

    // wait until definition exists
    if (!definition) {
      return new Promise(resolve => setTimeout(resolve, 1000))
      .then(() => {
        return sync(organizationId, accountId)(dispatch, getState);
      });
    }
    const resources = isOps ? {} : definition.resources;

    dispatch({ type: actionTypes.fetchStart });
    return Promise.all(
      Object.keys(resources)
      .map((resource) => {
        return watchCollection(`state/links/${integration}/${organizationId}/${accountId}/resources/${resource}`, (items, paths) => {
          dispatch({ type: actionTypes.updateSuccess, items, paths, resource });
        });
      })
    )
    .then(() => {
      if (organizationId === 'org-for-testing-policies') {
        return Promise.all(
          Object.keys(resources)
          .map((resource) => {
            return watchCollection(`state/links/${integration}/${organizationId}/${accountId}/_resources/${resource}`, (items, paths) => {
              dispatch({ type: actionTypes.updateSuccess, items, paths, _resource: resource });
            });    
          })
        );
      }
      return Promise.resolve();
    })
    .then(() => {
      return Promise.all(
        ['details', 'preferences', 'metas']
        .map((name) => {
          return watchValue(`state/links/${integration}/${organizationId}/${accountId}/${name}`, (items, paths) => {
            dispatch({ type: actionTypes.updateSuccess, items, paths, name });
          });
        })
      );
    })
    .then((items) => {
      dispatch({ type: actionTypes.fetchSuccess });
    });

  };
}

export function syncRelevantData(organizationId, accountId, paymentId) {
  return (dispatch, getState) => {
    const payment = getState().account.paymentStatuses.data.items[paymentId];

    const transfersInStore = getState().account.achIntegration.data.resources.transfers;

    dispatch({ type: actionTypes.fetchStart });

    // Payments have _oldId as legacy id or duplicate of new push Ids
    if (transfersInStore[payment._oldId]) return dispatch({ type: actionTypes.fetchSuccess });

    const resources = ['transfers'];

    return Promise.all(
      resources.map((resource) => {
        return watchValue(`state/links/achIntegration/${organizationId}/${accountId}/resources/${resource}/${payment._oldId}`, (item, paths) => { 
          dispatch({ type: actionTypes.updateSuccess, items: { [item._forPaymentId]: item }, paths, resource }); 
        });
      }).flat()
    )
    .then((items) => {
      dispatch({ type: actionTypes.fetchSuccess });
    });
  };
}

export function updatePreferences(organizationId, accountId, data) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });
    return API_achIntegration.updatePreferences(organizationId, accountId, data)
    .then((res) => {
      dispatch({ type: actionTypes.updateSuccess, data: res });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function update(organizationId, accountId, data) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });
    return API_achIntegration.update(organizationId, accountId, data)
    .then((res) => {
      dispatch({ type: actionTypes.updateSuccess, data: res });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function link(organizationId, accountId, data) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.createStart });
    return API_achIntegration.link(organizationId, accountId, data)
    .then((res) => {
      dispatch({ type: actionTypes.createSuccess, data: res });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function unlink(organizationId, accountId, data) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });
    return API_achIntegration.unlink(organizationId, accountId, data)
    .then((res) => {
      dispatch({ type: actionTypes.updateSuccess, data: res });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

export function getIssues(organizationId, accountId, issueType) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    const ids = getState().account.achIntegration.data.metas || {};
    
    let data = {};
    return Promise.all(Object.keys(ids || {}).map((key) => {
      return watchValues(`state/links/achIntegration/${organizationId}/${accountId}/links/${key}`, Object.keys(ids[key][issueType.toLowerCase()] || {}), (items, paths) => {
        data = { ...items, ...data };
        Object.keys(items || {}).forEach((item) => { data[item].itemType = key; });
        return data;
      });
    }))
    .then(() => {
      dispatch({ type: actionTypes.fetchSuccess, items: data, name: 'currentIssues' });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.fetchError, error: error.response.data.error });
    });
  };
}

export function syncQueue(queue) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.updateStart });
    const organizationId = getState().organization.data.id;
    const accountId = getState().account.data.id;
    return API_integrationManagement.sync(organizationId, accountId, 'achIntegration', queue)
    .then((res) => {
      dispatch({ type: actionTypes.updateSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.achIntegration.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}
