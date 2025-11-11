import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import {
  watchCollection, watchValue, removeListeners, watchValues, watchSlice,
} from 'store/_utilities/firebaseHelpers';
import APICardsIntegration from 'api/cardsIntegration';
import APIIntegrationManagement from 'api/integrationManagement';

const namespace = 'CARDSINTEGRATION';
// eslint-disable-next-line import/exports-last
export const actionTypes = createActionTypes(namespace);

// Helper functions
function syncAssociatedCardData(organizationId, accountId, dispatch, details = {}) {
  const { cardIds, existingCardIds, resources } = details;
  return Promise.all(
    (cardIds.map((cardId) => {
      if (existingCardIds.includes(cardId)) { return Promise.resolve(); }
      return Promise.all(
        resources.map((resourceType) => watchSlice(
            `state/links/cardsIntegration/${organizationId}/${accountId}/resources/${resourceType}`,
            { parameter: '_cardId', parameterValue: cardId },
            (items, paths) => {
              dispatch({
                type: actionTypes.updateSuccess, items, paths, resource: resourceType,
              });
            }
          ))
      );
    }))
  );
}

export const defaultState = {
  paths: {},
  resources: {
    vCards: {},
    pCards: {},
    auths: {},
    clears: {},
    declines: {},
  },
  statuses: { // TODO add specific statuses for resouces
    vCards: {},
    pCards: {},
    auths: {},
    clears: {},
    declines: {},
  },
  details: {},
  preferences: {},
  _resources: {},
};

export function _moduleReducers(state = defaultState, action = {}) {
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
          ...((action.resource && {
            [action.resource]: {
              ...(action.removeData ? {} : state.resources[action.resource]),
              ...action.items,
            },
          }) || {}),
        },
        _resources: {
          ...state._resources,
          ...((action._resource && {
            [action._resource]: {
              ...state._resources[action._resource],
              ...action.items,
            },
          }) || {}),
        },
        ...((action.name && {
          [action.name]: {
            ...state.resources[action.resource],
            ...action.items,
          },
        }) || {}),
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
export function syncRelevantData(organizationId, accountId, paymentId) {
  return (dispatch, getState) => {
    const payment = getState().account.paymentStatuses.data.items[paymentId];
    if (payment.created.method !== 'vCard') { return; }

    const vCardsInStore = getState().account.cardsIntegration.data.resources.vCards;

    const vCardsOnPayment = payment.funded && payment.funded.vCards ? payment.funded.vCards : null;
    if (!vCardsOnPayment) { return; }

    dispatch({ type: actionTypes.fetchStart });
    // check for cards already in store
    const cardsToSync = vCardsOnPayment.filter((card) => !vCardsInStore[card.id]);

    if (!cardsToSync.length) { dispatch({ type: actionTypes.fetchSuccess }); }

    const resources = ['auths', 'clears', 'declines', 'vCards'];

    Promise.all(
      resources.map((resource) => cardsToSync.map((card) => watchSlice(
        `state/links/cardsIntegration/${organizationId}/${accountId}/resources/${resource}`,
        { parameter: resource === 'vCards' ? 'id' : 'cardId', parameterValue: card.id },
        (items, paths) => {
          dispatch({
            type: actionTypes.updateSuccess,
            items,
            paths,
            resource,
          });
        }
      ))).flat()
    )
    .then(() => {
      dispatch({ type: actionTypes.fetchSuccess });
    });
  };
}

export function sync(organizationId, accountId) {
  const integration = 'cardsIntegration';
  return (dispatch, getState) => {
    const definition = getState().integrationDefinitions.data.items[integration];
    const isOps = getState().appConfig.data.metadata.name === 'ops';
    // wait until definition exists
    if (!definition) {
      // eslint-disable-next-line no-promise-executor-return
      return new Promise((resolve) => setTimeout(resolve, 1000))
      .then(() => sync(organizationId, accountId)(dispatch, getState));
    }
    dispatch({ type: actionTypes.fetchStart });

    // if in ops dashboard we want to only sync accounts. dont need to sync other resources here 
    const resources = isOps ? { accounts: true } : definition.resources;
    if (getState().appConfig.data.metadata.name === 'wfs') {
      const userData = getState().user.access.data;
      const userRoles = getState().user.roles.data.item;
      const userAccountRoles = userRoles.accountLevel && Object.keys(userRoles.accountLevel[organizationId][accountId]);
      if (userAccountRoles && userAccountRoles.includes('wfs_myWorldCard:CustomerCardholder')) {
        return watchSlice(
          `state/links/${integration}/${organizationId}/${accountId}/resources/pCards`,
          { parameter: 'assignedTo', parameterValue: userData.uid },
          (items, paths) => {
            const existingData = getState().account.cardsIntegration.data.resources.pCards;
            const existingCardIds = Object.keys(existingData || {});
            syncAssociatedCardData(
              organizationId,
              accountId,
              dispatch,
              {
                resources: ['auths', 'clears', 'declines'],
                existingCardIds,
                cardIds: Object.keys(items),
              }
            );
            dispatch({
              type: actionTypes.updateSuccess, items, paths, resource: 'pCards', removeData: true,
            });
          }
        ).then(() => {
          dispatch({ type: actionTypes.fetchSuccess });
        });
      }
    }
    return Promise.all(
      Object.keys(resources)
      .map((resource) => watchCollection(
          `state/links/${integration}/${organizationId}/${accountId}/resources/${resource}`,
          (items, paths) => {
            dispatch({
              type: actionTypes.updateSuccess, items, paths, resource,
            });
          }
        ))
    )
    .then(() => {
      if (organizationId === 'org-for-testing-policies') {
        return Promise.all(
          Object.keys(definition.resources).map((resource) => watchCollection(
            `state/links/${integration}/${organizationId}/${accountId}/_resources/${resource}`,
            (items, paths) => {
              dispatch({
                type: actionTypes.updateSuccess, items, paths, _resource: resource,
              });
            }
          ))
        );
      }
      return Promise.resolve();
    })
    .then(() => Promise.all(
        ['details', 'preferences', 'metas']
        .map((name) => watchValue(
          `state/links/${integration}/${organizationId}/${accountId}/${name}`,
          (items, paths) => {
            dispatch({
              type: actionTypes.updateSuccess, items, paths, name, 
            });
          }
        ))
      ))
    .then(() => {
      dispatch({ type: actionTypes.fetchSuccess });
    });
  };
}

export function updatePreferences(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return APICardsIntegration.updatePreferences(organizationId, accountId, data)
    .then((res) => {
      dispatch({ type: actionTypes.updateSuccess, data: _try(() => res.data.data, {}) });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function link(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return APICardsIntegration.link(organizationId, accountId, data)
    .then((res) => {
      dispatch({ type: actionTypes.createSuccess, data: _try(() => res.data.data, {}) });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function update(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return APICardsIntegration.update(organizationId, accountId, data)
    .then((res) => {
      dispatch({ type: actionTypes.updateSuccess, data: _try(() => res.data.data, {}) });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function unlink(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return APICardsIntegration.unlink(organizationId, accountId, data)
    .then((res) => {
      dispatch({ type: actionTypes.updateSuccess, data: _try(() => res.data.data, {}) });
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

export function createAccount(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return APICardsIntegration.createAccount(organizationId, accountId, data)
      .then((res) => {
        dispatch({ type: actionTypes.createSuccess, data: _try(() => res.data.data, {}) });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.createError, error: error.response.data.error });
      });
  };
}

export function createVCard(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return APICardsIntegration.createVCard(organizationId, accountId, data)
    .then((res) => {
      dispatch({ type: actionTypes.createSuccess, data: _try(() => res.data.data, {}) });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function updateVCard(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return APICardsIntegration.updateVCard(organizationId, accountId, data)
    .then((res) => {
      dispatch({ type: actionTypes.updateSuccess, data: _try(() => res.data.data, {}) });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function createPCard(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return APICardsIntegration.createPCard(organizationId, accountId, data)
    .then((res) => {
      dispatch({ type: actionTypes.createSuccess, data: _try(() => res.data.data, {}) });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function updatePCard(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return APICardsIntegration.updatePCard(organizationId, accountId, data)
    .then((res) => {
      dispatch({ type: actionTypes.updateSuccess, data: _try(() => res.data.data, {}) });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function getIssues(organizationId, accountId, issueType) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    const ids = getState().account.cardsIntegration.data.metas || {};

    let data = {};
    return Promise.all(Object.keys(ids || {}).map((key) => watchValues(
      `state/links/cardsIntegration/${organizationId}/${accountId}/links/${key}`,
      Object.keys(ids[key][issueType.toLowerCase()] || {}),
      (items) => {
        data = { ...items, ...data };
        Object.keys(items || {}).forEach((item) => { data[item].itemType = key; });
        return data;
      }
    )))
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
    return APIIntegrationManagement.sync(organizationId, accountId, 'cardsIntegration', queue)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.cardsIntegration.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}
