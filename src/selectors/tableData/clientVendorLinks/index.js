import createSelector from 'selector';

import Utils from 'utils';
import Selectors from 'selectors';

const selectors_tableData_clientVendorLinks = createSelector(
  'selectors_tableData_clientVendorLinks',

  (state) => state.account.clientVendorLinks.data.items,
  (state) => state.account.clients.data.items,
  (state) => state.account.clients.collections,
  (state) => state.account.accountVendors.data.items,
  (state) => Selectors.globalTaggedItems(state),
  (state) => state.account.paymentPipelinePreferences.data.item.defalutGlobalVendorTagId,

  (clientVendorLinks = {}, clientsData = {}, clientsCollections = {}, vendors = {}, globalTaggedItems, defaultTag) => {
    const clientVendorLinksTableData = { items: {}, count: 0 };

    const clientVendorLinksKeys = Object.keys(clientVendorLinks);
    clientVendorLinksTableData.count = clientVendorLinksKeys.count;
    clientVendorLinksKeys.forEach((clientVendorLinkId) => {
      const clientVendorLink = clientVendorLinks[clientVendorLinkId] || {};
      const client = clientsData[clientsCollections._ids[clientVendorLink.clientId][0]];
      const vendor = vendors[clientVendorLink.vendorId];

      let credentialSchema;
      let credentialsDisplay = 'none';
      const globalVendorId = vendor.globalVendorRef;
      if (globalVendorId && defaultTag) {
        credentialSchema = _try(() => globalTaggedItems.vendors[globalVendorId].tags[defaultTag].vCard.credentialSchema.fields);
        if (credentialSchema) {
          credentialsDisplay = Utils.isSchemaValid(credentialSchema, clientVendorLink.credentials || {}) ? 'valid' : 'invalid';
        }
      }

      clientVendorLinksTableData.items[clientVendorLinkId] = {
        ...clientVendorLink,
        clientDisplay: _try(() => client.display, ''),
        vendorDisplay: _try(() => vendor.display, ''),
        credentialSchema,
        credentialsDisplay,
      };
    });

    return clientVendorLinksTableData;
  }

);

export default selectors_tableData_clientVendorLinks;

