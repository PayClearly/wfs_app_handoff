import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchValue, watchValues, removeListeners } from 'store/_utilities/firebaseHelpers';
import { hasPolicy, readableOrganizations } from 'store/_utilities/privilegesHelper';
import AttachmentsAPI from 'api/attachments';
import OrganizationsAPI from 'api/organizations';

import * as organization from 'store/organization';


const namespace = 'ORGAINZATIONS';
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
        items: { ...state.items, ...action.data },
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
export function sync(desiredContext) {
  return (dispatch, getState) => {

    // either sync All Of the organizations or just the one the user has access to
    const hasAllPolicy = hasPolicy(getState().user, 'organizations_*_read');
    const action = (data, paths) => { dispatch({ type: actionTypes.fetchSuccess, data, paths }); };
    let toWatch;

    dispatch({ type: actionTypes.fetchStart });

    if (hasAllPolicy) {
      toWatch = watchValue('state/organizations', action);
    } else {
      toWatch = watchValues('state/organizations', readableOrganizations(getState().user), action);
    }

    const route = getState().router.baseUrl;
    
    if (route.includes('ops')) {      
      if (!desiredContext) return toWatch;
    }

    return toWatch
    .then(() => {
      if (desiredContext) {
        return organization.sync(desiredContext.orgId, desiredContext.accountId)(dispatch, getState);
      }
      return organization.sync()(dispatch, getState);
    });

  };
}

export function clear() {
  return (dispatch, getState) => {
    organization.clear()(dispatch, getState);
    removeListeners(getState().organizations.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function update(organizationId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return _updateOrganization(data, organizationId)(dispatch)
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function create(data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return OrganizationsAPI.create(data)
    .then(() => {
      dispatch({ type: actionTypes.createSuccess });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

// private helpers
export function _updateOrganization(org, orgId) {
  const field = org.darkLogo ? 'darkLogo' : 'logo';
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return Promise.resolve()
    .then(() => {
      // create attachments if they don't already exist
      return AttachmentsAPI.create(org[field], `attachments/organizations/${orgId}`)
      .then((response) => {
        return response.data.attachments;
      });
    })
    .then((attachments) => {
      return OrganizationsAPI.update(orgId, { ...org, [field]: attachments[0] || null });
    })
    .then(() => {
      dispatch({ type: actionTypes.updateSuccess });
      return orgId;
    })
    .catch((error) => {
      return dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}
