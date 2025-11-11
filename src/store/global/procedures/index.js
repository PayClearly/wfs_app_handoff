import { combineReducers } from 'redux';
import { createStatusReducer, createActionTypes } from 'store/_utilities/statusReducerFactory';
import { watchCollection, removeListeners, watchValue } from 'store/_utilities/firebaseHelpers';
import GlobalVendorAPI from 'api/globalVendors';
import AttachmentsAPI from 'api/attachments';

const namespace = 'GLOBALVENDORPROCEDURES';
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
export function sync() {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    watchCollection('state/globalVendors/procedures', (data, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, data, paths });
    });
  };
}

export function syncRelevantData(id) {
  return (dispatch, getState) => {
    dispatch({ type: actionTypes.fetchStart });
    const inStore = getState().global.procedures.data.items[id];
    if (!id || inStore) {
      return dispatch({ type: actionTypes.fetchSuccess });
    }

    watchValue(`state/globalVendors/procedures/${id}`, (item, paths) => {
      dispatch({ type: actionTypes.fetchSuccess, data: { [item._id]: item }, paths });
    });
  };
}
export function clear() {
  return (dispatch, getState) => {
    removeListeners(getState().global.procedures.data.paths);
    dispatch({ type: actionTypes.clear });
  };
}

export function create(data, groupData) {
  return (dispatch) => {
    dispatch({ type: actionTypes.createStart });
    const { method, groupId } = groupData;
    // 1) Create procedure without attachment
    let procedureToReturn;
    let procedureId;
    return GlobalVendorAPI.createProcedure(_adaptToAPI({ ...data, groupId }, method))
      .then((response) => {
        procedureToReturn = response;
        const procedure = response.data.data || {};
        procedureId = procedure._id;
        if (!procedureId) {
          throw new Error('Workflow creation failed');
        }

        // 2) Create attachments
        return AttachmentsAPI.create(data.attachments, `attachments/globalVendors/procedures/${procedureId}`);
      })
      .then((response) => response.data.attachments)
      .then((attachments) => {
        // 3) Update procedure with attachments
        if (attachments.length) {
          return GlobalVendorAPI.updateProcedure(procedureId, { attachments, vCardPaymentForm: attachments[0] });
        }
        return Promise.resolve();
      })
      .then((response) => {
        dispatch({ type: actionTypes.createSuccess });
        if (response) {
          return response.data;
        }
        return procedureToReturn.data;
      })
      .catch((error) => {
        dispatch({ type: actionTypes.createError, error: error.response.data.error });
      });
  };
}

export function update(id, data, method) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    // 1) Create attachments if they don't exist
    return AttachmentsAPI.create(data.attachments, `attachments/globalVendors/procedures/${id}`)
      .then((response) => response.data.attachments)
      .then((attachments) => {
        // 3) Update procedure
        // determine if attachments have been changed
        const sameAttachments = _try(() => data.attachments[0]._createdBy);
        return GlobalVendorAPI.updateProcedure(id, _adaptToAPI(data, method, attachments, sameAttachments));
      })
      .then(() => {
        dispatch({ type: actionTypes.updateSuccess });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.updateError, error: error.response.data.error });
      });
  };
}

export function resendACHTermsAndConditionsEmail(procedureId, data) {
  return (dispatch) => {
    dispatch({ type: actionTypes.updateStart });
    return GlobalVendorAPI.resendACHTermsAndConditionsEmail(procedureId, data)
      .then(() => {
        dispatch({ type: actionTypes.updateSuccess });
      })
      .catch((error) => dispatch({ type: actionTypes.updateError, error: error.response.data.error }));
  };
}

export function clearErrors() {
  return (dispatch) => dispatch({ type: actionTypes.clearErrors, data: {} });
}

// private helper

function _adaptToAPI(data, method, attachments = null, sameAttachments) {
  if (method === 'vCard') {
    const procedure = {
      useEmailTemplate: null,
      useFaxTemplate: null,
      vCardMaxPerCardAmount: data.vCardMaxPerCardAmount ? parseFloat(data.vCardMaxPerCardAmount, 10) : null,
      vCardRequireUniqueAmounts: data.vCardRequireUniqueAmounts || false,
      vCardDeliveryMethod: data.vCardDeliveryMethod || null,
      vCardEmails: (data.vCardEmails && data.vCardDeliveryMethod === 'email') ? (data?.vCardEmails?.split(',') || data.vCardEmails) : null,
      vCardFaxNumbers: (data.vCardFaxNumbers && data.vCardDeliveryMethod === 'fax') ? (data?.vCardFaxNumbers?.split(',') || data.vCardFaxNumbers) : null,
      vCardCCEmails: (data.vCardCCEmails && data.vCardDeliveryMethod === 'email') ? (data?.vCardCCEmails?.split(',') || data.vCardCCEmails) : null,
      vCardUseFaxTemplate: (Object.prototype.hasOwnProperty.call(data, 'vCardUseFaxTemplate') && data.vCardDeliveryMethod === 'fax') ? !!data.vCardUseFaxTemplate : null,
      vCardUseEmailTemplate: (Object.prototype.hasOwnProperty.call(data, 'vCardUseEmailTemplate') && data.vCardDeliveryMethod === 'email') ? !!data.vCardUseEmailTemplate : null,
      vCardNotifyOnCreation: Object.prototype.hasOwnProperty.call(data, 'vCardNotifyOnCreation') ? !!data.vCardNotifyOnCreation : null,
      vCardNotifyOnCreationEmails: data.vCardNotifyOnCreationEmails ? data?.vCardNotifyOnCreationEmails?.split(',') || data.vCardNotifyOnCreationEmails : null,
      vCardNotifyOnCompletion: Object.prototype.hasOwnProperty.call(data, 'vCardNotifyOnCompletion') ? !!data.vCardNotifyOnCompletion : null,
      vCardNotifyOnCompletionEmails: data.vCardNotifyOnCompletionEmails ? data?.vCardNotifyOnCompletionEmails?.split(',') || data.vCardNotifyOnCompletionEmails : null,
      vCardFlowId: data.vCardFlowId || null,
      vCardHideCCBINNumber: data.vCardHideCCBINNumber || null,
      notes: data.notes || null,
      type: method,
      active: Object.prototype.hasOwnProperty.call(data, 'active') ? !!data.active : true,
      groupId: data.groupId,
      bin: data.bin,
    };

    // the entity/creator will always send attachments as an array, if not attachments are added or attachments should be removed this adapter will receive an empty array. If empty, the paymentForm will be set to null and the attachments property will be an empty array (which is handled as null by firebase).
    if (attachments) {
      const shouldHavePaymentForm = ((data.vCardDeliveryMethod === 'email' && !data.vCardUseEmailTemplate) || (data.vCardDeliveryMethod === 'fax' && !data.VCardUseFaxTemplate));
      if (sameAttachments && shouldHavePaymentForm) {
        // handles the ownership restriction on attachments by not sending attachment metadata in the payload if its not being changed
        procedure.vCardPaymentForm = undefined;
        procedure.attachments = undefined;
      } else {
        procedure.vCardPaymentForm = attachments.length && shouldHavePaymentForm ? attachments[0] : null;
        procedure.attachments = attachments;
      }
    }

    return procedure;
  } if (method === 'ACH') {
    const procedure = {
      achProvider: data.achProvider,
      achNotes: data.achNotes || null,
      achFirstName: data.achFirstName || null,
      achLastName: data.achLastName || null,
      achEmail: data.achEmail || null,
      achRoutingNumber: data.achRoutingNumber || null,
      achAccountNumber: data.achAccountNumber || null,
      achMaxTransactionAmount: data.achMaxTransactionAmount ? parseFloat(data.achMaxTransactionAmount, 10) : null,
      achDeliverySpeed: getAchDeliverySpeed(data.achDeliveryMethod, data.achDeliverySpeed),
      achDeliveryMethod: data.achDeliveryMethod || null,
      achNotifyOnCreation: Object.prototype.hasOwnProperty.call(data, 'achNotifyOnCreation') ? !!data.achNotifyOnCreation : null,
      achNotifyOnCreationEmails: data.achNotifyOnCreationEmails ? data?.achNotifyOnCreationEmails?.split(',') || data.achNotifyOnCreationEmails : null,
      achNotifyOnCompletion: Object.prototype.hasOwnProperty.call(data, 'achNotifyOnCompletion') ? !!data.achNotifyOnCompletion : null,
      achNotifyOnCompletionEmails: data.achNotifyOnCompletionEmails ? data?.achNotifyOnCompletionEmails?.split(',') || data.achNotifyOnCompletionEmails : null,
      active: Object.prototype.hasOwnProperty.call(data, 'active') ? !!data.active : true,
      type: method,
      groupId: data.groupId,
    };

    return procedure;
  }

  const checkPaymentAddress = {
    streetAddress: data.streetAddress || null,
    unit: data.unit || null,
    city: data.city || null,
    state: data.state || null,
    zipCode: data.zipCode || null,
    country: data.country || null,
  };

  const procedure = {
    checkPaymentAddress: Object.values(checkPaymentAddress).some((item) => !!item) ? checkPaymentAddress : null,
    checkPayeeName: data.checkPayeeName || null,
    checkUserMustSend: data.checkUserMustSend || null,
    notes: data.notes || null,
    type: method,
    active: Object.prototype.hasOwnProperty.call(data, 'active') ? !!data.active : true,
  };
  return procedure;
}

function getAchDeliverySpeed(achDeliveryMethod, achDeliverySpeed) {

  if (achDeliveryMethod === 'pullAch') {
    return null;
  }

  return achDeliverySpeed || 'next-day';

}
