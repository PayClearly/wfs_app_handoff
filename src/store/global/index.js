import { combineReducers } from 'redux';
import { reducerCreator, createActionTypes } from 'store/_utilities/statusReducerFactory';
import AttachmentsAPI from 'api/attachments';


// Import Child Ducks
import * as vendors from 'store/global/vendors';
import * as schemas from 'store/global/schemas';
import * as credentialSchemas from 'store/global/credentialSchemas';
import * as metadata from 'store/global/metadata';
import * as groups from 'store/global/groups';
import * as tags from 'store/global/tags';
import * as prefills from 'store/global/prefills';
import * as procedures from 'store/global/procedures';
import * as attachments from 'store/global/attachments';
import * as vendorTermsAndConditions from 'store/global/vendortermsandconditions';
import * as standardCredentialFields from 'store/global/standardCredentialFields';
import * as botWorkers from 'store/global/botWorkers';

const namespace = 'GLOBAL';
const vertical = reducerCreator({ vertical: 'politicalmedia' }, namespace);
export const actionTypes = createActionTypes(namespace);

export const reducer = combineReducers({
  data: vertical.reducer,
  vendors: vendors.reducer,
  schemas: schemas.reducer,
  credentialSchemas: credentialSchemas.reducer,
  metadata: metadata.reducer,
  procedures: procedures.reducer,
  groups: groups.reducer,
  tags: tags.reducer,
  prefills: prefills.reducer,
  attachments: attachments.reducer,
  latestTermsAndConditions: vendorTermsAndConditions.reducer,
  standardCredentialFields: standardCredentialFields.reducer,
  botWorkers: botWorkers.reducer,
});

export default reducer;

// action creators
export function sync() {
  return (dispatch, getState) => {
    const appStoreConfig = _try(() => getState().appConfig.data.store);

    Promise.all([
      { key: 'schemas', actionCreators: schemas },
      { key: 'credentialSchemas', actionCreators: credentialSchemas },
      { key: 'groups', actionCreators: groups },
      { key: 'tags', actionCreators: tags },
    ].map((duck) => {
      const { key, actionCreators } = duck;

      if (!_try(() => appStoreConfig.global[key])) { return Promise.resolve(); }
      return actionCreators.sync()(dispatch, getState);
    }).concat([_syncAdmin(dispatch, getState)]));
  };
}

function _syncAdmin(dispatch, getState) {
  const appStoreConfig = _try(() => getState().appConfig.data.store);

  Promise.all([
    { key: 'metadata', actionCreators: metadata },
    { key: 'procedures', actionCreators: procedures },
    { key: 'vendors', actionCreators: vendors },
    { key: 'prefills', actionCreators: prefills },
    { key: 'standardCredentialFields', actionCreators: standardCredentialFields },
  ].map((duck) => {
    const { key, actionCreators } = duck;

    if (!_try(() => appStoreConfig.global[key])) { return Promise.resolve(); }
    return actionCreators.sync()(dispatch, getState);
  }));
}

export function clear() {
  return (dispatch, getState) => {
    vendors.clear()(dispatch, getState);
    schemas.clear()(dispatch, getState);
    credentialSchemas.clear()(dispatch, getState);
    metadata.clear()(dispatch, getState);
    procedures.clear()(dispatch, getState);
    groups.clear()(dispatch, getState);
    tags.clear()(dispatch, getState);
    prefills.clear()(dispatch, getState);
    standardCredentialFields.clear()(dispatch, getState);
  };
}

export function createGlobalVendor(data) {
  return (dispatch, getState) => vendors.create(data)(dispatch, getState);
}

export function updateGlobalVendor(id, data) {
  return (dispatch, getState) => vendors.update(id, data)(dispatch, getState);
}

export function clearErrorsGlobalVendor() {
  return (dispatch, getState) => vendors.clearErrors()(dispatch, getState);
}

export function createGlobalVendorGroup(data) {
  return (dispatch, getState) => Promise.resolve()
      .then(() => groups.create(data)(dispatch, getState))
      .then((response) => {
        const group = response.data.data || {};
        _updateGlobalVendorsInGroup(group._id, data, dispatch, getState);
      });
}

export function updateGlobalVendorGroup(id, data) {
  return (dispatch, getState) => Promise.resolve()
      .then(() => groups.update(id, data)(dispatch, getState))
      .then(() => {
        _updateGlobalVendorsInGroup(id, data, dispatch, getState);
      });
}

export function updateGlobalVendorGroupPSOP(id, data, method) {
  return (dispatch, getState) => groups.updatePSOP(id, data, method)(dispatch, getState);
}

export function clearErrorsGlobalVendorGroup() {
  return (dispatch, getState) => groups.clearErrors()(dispatch, getState);
}

export function createGlobalVendorTag(data) {
  return (dispatch, getState) => tags.create(data)(dispatch, getState);
}

export function updateGlobalVendorTag(id, data) {
  return (dispatch, getState) => tags.update(id, data)(dispatch, getState);
}

export function clearErrorsGlobalVendorTag() {
  return (dispatch, getState) => tags.clearErrors()(dispatch, getState);
}

export function createGlobalVendorSchema(data) {
  return (dispatch, getState) => schemas.create(data)(dispatch, getState);
}

export function updateGlobalVendorSchema(id, data) {
  return (dispatch, getState) => schemas.update(id, data)(dispatch, getState);
}

export function clearErrorsGlobalVendorSchemas() {
  return (dispatch, getState) => schemas.clearErrors()(dispatch, getState);
}

export function createGlobalCredentialSchema(data) {
  return (dispatch, getState) => credentialSchemas.create(data)(dispatch, getState);
}

export function updateGlobalCredentialSchema(id, data) {
  return (dispatch, getState) => credentialSchemas.update(id, data)(dispatch, getState);
}

export function clearErrorsGlobalCredentialSchemas() {
  return (dispatch, getState) => credentialSchemas.clearErrors()(dispatch, getState);
}

export function createGlobalVendorProcedure(data, groupData) {
  return (dispatch, getState) => procedures.create(data, groupData)(dispatch, getState)
      .then((procedureData) => {
        const { groupId, method } = groupData;
        const procedureId = procedureData.data._id;

        const PSOPData = {
          procedure: procedureId,
          accepts: true,
        };

        return groups.updatePSOP(groupId, PSOPData, method)(dispatch, getState);
      });
}

export function updateGlobalVendorProcedure(id, data, method) {
  return (dispatch, getState) => procedures.update(id, data, method)(dispatch, getState);
}

export function resendACHTermsAndConditionsEmail(procedureId, data) {
  return (dispatch, getState) => procedures.resendACHTermsAndConditionsEmail(procedureId, data)(dispatch, getState);
}

export function clearErrorsGlobalVendorProcedure() {
  return (dispatch, getState) => procedures.clearErrors()(dispatch, getState);
}

export function updateFormPrefill(id, data) {
  return (dispatch, getState) => prefills.update(id, data)(dispatch, getState);
}

export function fetchAttachment(attachmentMetadata) {
  return (dispatch) => attachments.fetch(attachmentMetadata)(dispatch);
}

export function downloadAttachment(attachmentMetadata) {
  return () => AttachmentsAPI.downloadAttachment(attachmentMetadata);
}

export function acceptTermsAndConditions(token) {
  return (dispatch, getState) => vendorTermsAndConditions.accept(token)(dispatch, getState);
}

export function fetchLatestTermsAndConditions(token) {
  return (dispatch) => vendorTermsAndConditions.fetch(token)(dispatch);
}

// export function downloadPS21(batchId) {
//   return (dispatch, getState) => {
//     return attachments.downloadPS21(batchId)(dispatch, getState);
//   };
// }

// export function downloadAPRETURN(batchId) {
//   return (dispatch, getState) => {
//     return attachments.downloadAPRETURN(batchId)(dispatch, getState);
//   };
// }

const _updateGlobalVendorsInGroup = (groupId, data, dispatch, getState) => {
  const globalVendorIds = (data.globalVendorIds || []);

  const globalVendorsNewToGroup = globalVendorIds
    .filter((vendorId) => {
      const groupIds = _try(() => getState().global.vendors.data.items[vendorId].groupIds);
      return !groupIds || !groupIds.includes(groupId);
    });

  const globalVendorsLeavingGroup = Object.keys(getState().global.vendors.data.items)
    .filter((vendorId) => {
      // find all globalVendors with this groupId
      const groupIds = _try(() => getState().global.vendors.data.items[vendorId].groupIds);
      return groupIds && groupIds.includes(groupId);
    })
    .filter((vendorId) => 
      // check to see if the globalVendor is included in the vendorIds payload
       !globalVendorIds.some((incollectionIds) => incollectionIds === vendorId));

  return Promise.all(
    globalVendorsNewToGroup
      .map((vendorId) => {
        const globalVendor = getState().global.vendors.data.items[vendorId];
        const globalVendorMetadata = getState().global.metadata.data.items[vendorId] || {};
        const groupIds = _try(() => globalVendor.groupIds, []);
        groupIds.push(groupId);
        return updateGlobalVendor(vendorId, {
          groupIds,
          active: globalVendor.active,
          metadata: {
            website: globalVendorMetadata.website || null,
            phoneNumber: globalVendorMetadata.phoneNumber || null,
            email: globalVendorMetadata.email || null,
            address: globalVendorMetadata.address || null,
            contacts: globalVendorMetadata.contacts || null,
          },
        })(dispatch, getState);
      }),
    globalVendorsLeavingGroup
      .map((vendorId) => {
        const globalVendor = getState().global.vendors.data.items[vendorId];
        const globalVendorMetadata = getState().global.metadata.data.items[vendorId] || {};

        const newGroupIds = globalVendor.groupIds.slice();
        newGroupIds.splice(newGroupIds.findIndex((vendorGroupId) => vendorGroupId === groupId), 1);
        return updateGlobalVendor(vendorId, {
          groupIds: newGroupIds,
          active: globalVendor.active,
          metadata: {
            website: globalVendorMetadata.website || null,
            phoneNumber: globalVendorMetadata.phoneNumber || null,
            email: globalVendorMetadata.email || null,
            address: globalVendorMetadata.address || null,
            contacts: globalVendorMetadata.contacts || null,
          },
        })(dispatch, getState);
      })
);
};
