import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, removeListeners } from 'store/_utilities/firebaseHelpers';
import ACHAPI from 'api/ach';

const namespace = 'ACH_ACCOUNTS';
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
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    return watchCollection(`state/achAccounts/${organizationId}/${accountId}`, (items, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, items, paths });
    });
  };
}

export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().account.achAccounts.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function create(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return ACHAPI.create(organizationId, accountId, _adaptACHAccountToAPI(data))
    .then((res) => {
      dispatch({ type: actionTypes.createSuccess, data: res });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function update(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return ACHAPI.update(organizationId, accountId, data)
    .then((res) => {
      dispatch({ type: actionTypes.createSuccess, data: res });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function businessClassifications(organizationId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return ACHAPI.fetchBusinessClassifications(organizationId, accountId)
    .then((response) => {
      dispatch({ type: actionTypes.fetchSuccess });
      return response.data;
    });
  };
}

export function submitDocument(organizationId, accountId, data, query) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return ACHAPI.submitDocuments(organizationId, accountId, data, query)
    .then((res) => {
      dispatch({ type: actionTypes.createSuccess, data: res });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function addBeneficialOwner(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return ACHAPI.addBeneficialOwner(organizationId, accountId, _adaptBeneficialOwnerToAPI(data))
    .then((res) => {
      dispatch({ type: actionTypes.createSuccess, data: res });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function updateBeneficialOwner(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    return ACHAPI.updateBeneficialOwner(organizationId, accountId, _adaptBeneficialOwnerToAPI(data))
    .then((res) => {
      dispatch({ type: actionTypes.createSuccess, data: res });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.createError, error: error.response.data.error });
    });
  };
}

export function token(organizationId, accountId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.fetchStart });
    return ACHAPI.fetchIavToken(organizationId, accountId)
    .then((response) => {
      dispatch({ type: actionTypes.fetchSuccess });
      return response.data;
    });
  };
}

export function addFundingSource(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return ACHAPI.addFundingSource(organizationId, accountId, _adaptFundingSourceToAPI(data))
    .then((res) => {
      dispatch({ type: actionTypes.updateSuccess, data: res });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.error });
    });
  };
}

export function certifyBeneficialOwnership(organizationId, accountId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return ACHAPI.certifyBeneficialOwnership(organizationId, accountId, _adaptCertificationToAPI(data))
    .then((res) => {
      dispatch({ type: actionTypes.updateSuccess, data: res });
    })
    .catch((error) => {
      dispatch({ type: actionTypes.updateError, error: error.response.data.errer });
    });
  };
}

export function clearErrors() {
  return (dispatch) => {
    dispatch({ type: actionTypes.clearErrors, data: {} });
  };
}

// helpers
function _adaptACHAccountToAPI(data) {
  const ACHAccountDataPayload = {
    firstName: data.adminFirstName, // The legal first name of the Account Admin or individual signing up the business verified Customer.
    lastName: data.adminLastName, // The legal last name of the Account Admin or individual signing up the business verified Customer.
    email: data.adminEmail,
    type: 'business',
    address1: data.businessAddress1,
    city: data.businessCity,
    state: data.businessState,
    postalCode: data.businessPostalCode,
    controller: {
      firstName: data.controllerFirstName,
      lastName: data.controllerLastName,
      title: data.controllerTitle,
      dateOfBirth: data.controllerDOB,
      ssn: data.controllerSSN,
      address: {
        address1: data.controllerAddress1,
        address2: data.controllerAddress2,
        city: data.controllerCity,
        stateProvinceRegion: data.controllerState,
        postalCode: data.controllerPostalCode,
        country: data.controllerCountry,
      },
    },
    businessClassification: data.businessClassification,
    businessType: data.businessType,
    businessName: data.businessName,
    ein: data.businessEIN,
    status: data.status,
  };

  return ACHAccountDataPayload;
}

function _adaptBeneficialOwnerToAPI(data) {
  const beneficialOwnerDataPayload = {
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.dateOfBirth,
    ssn: data.ssn,
    address: {
      address1: data.address1,
      address2: data.address2,
      city: data.city,
      stateProvinceRegion: data.stateProvinceRegion,
      country: data.country,
      postalCode: data.postalCode,
    },
  };

  return beneficialOwnerDataPayload;
}

function _adaptFundingSourceToAPI(data) {
  return {
    fundingSourceId: data.fundingSourceLocation.split('funding-sources/')[1],
  };
}

function _adaptCertificationToAPI(data) {
  return {
    status: data.acceptsCertification && 'certified',
  };
}
