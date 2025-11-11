import createSelector from 'selector';

// Third Party Imports ...

import Selectors from 'selectors';

const selectors_csrGlobalItems = createSelector('selectors_csrGlobalItems',

  state => state.global.vendors.data.items,
  state => state.global.groups.data.items,
  state => state.global.tags.data.items,
  state => state.global.schemas.data.items,
  state => state.global.credentialSchemas.data.items,
  state => state.global.procedures.data.items,

  state => Selectors.csrGlobalItemsFetched(state),

  (vendors = {}, groups = {}, tags = {}, schemas = {}, credentialSchemas = {}, procedures = {}, csrGlobalItemsFetched) => {
    const globalItems = {
      byTag: {
        _none: {
          groups: {},
          vendors: {},
        },
      },
      byGroup: {
        _none: {
          tags: {},
          vendors: {},
        },
      },
      byVendor: {
        _none: {
          groups: {},
          tags: {},
        },
      },
      vendorTagToPSOP: {},
    };

    if (!csrGlobalItemsFetched) {
      globalItems.notFetched = true;
      return globalItems;
    }

    Object.values(vendors)
      .forEach((vendor) => {
        const vendorId = vendor._id;
        const groupIds = vendor.groupIds || [];

        if (_try(() => groupIds.length)) {
          groupIds.forEach((groupId) => {
            const group = groups[groupId];
            if (!group) return;
            if (!globalItems.byVendor[vendorId]) globalItems.byVendor[vendorId] = { groups: {}, tags: {} };
            globalItems.byVendor[vendorId].groups[groupId] = group.name;

            if (!globalItems.byGroup[groupId]) globalItems.byGroup[groupId] = { vendors: {}, tags: {} };
            globalItems.byGroup[groupId].vendors[vendorId] = vendor.name;
          });
        } else {
          globalItems.byGroup._none.vendors[vendorId] = vendor.name;
        }
      });

    Object.values(groups)
      .forEach((group) => {
        const groupId = group._id;
        const tagIds = group.tagIds || [];
        let vendorIds = [];

        if (!_try(() => globalItems.byGroup[groupId].vendors)) {
          globalItems.byVendor._none.groups[groupId] = group.name;
        } else {
          // handles finding the vendors for a group
          vendorIds = Object.keys(globalItems.byGroup[groupId].vendors);
          vendorIds.forEach((vendorId) => {
            if (!_try(() => globalItems.vendorTagToPSOP[vendorId])) globalItems.vendorTagToPSOP[vendorId] = {};
          });
        }

        if (_try(() => tagIds.length)) {
          tagIds.forEach((tagId) => {
            const tag = tags[tagId];
            const groupVendorIds = _try(() => Object.keys(globalItems.byGroup[groupId].vendors), []) || [];
            if (!globalItems.byGroup[groupId]) globalItems.byGroup[groupId] = { vendors: {}, tags: {} };
            globalItems.byGroup[groupId].tags[tagId] = tag.name;

            if (!globalItems.byTag[tagId]) globalItems.byTag[tagId] = { groups: {}, vendors: {} };
            globalItems.byTag[tagId].groups[groupId] = group.name;

            groupVendorIds.forEach((vendorId) => {
              if (!globalItems.byVendor[vendorId]) globalItems.byVendor[vendorId] = { groups: {}, tags: {} };
              globalItems.byVendor[vendorId].tags[tagId] = {
                name: tag.name,
                group,
              };

              if (!globalItems.byTag[tagId]) globalItems.byTag[tagId] = { groups: {}, vendors: {} };
              globalItems.byTag[tagId].vendors[vendorId] = vendors[vendorId].name;
            });

            // now do some aggregation for vendor -> tag -> method -> groupPSOP
            if (vendorIds.length) {
              const names = {
                groupName: group.name,
                tagName: tag.name,
              };

              vendorIds.forEach((vendorId) => {
                globalItems.vendorTagToPSOP[vendorId][tagId] = {
                  groupId,
                  vCard: Object.assign({}, group.vCard, names, { credentialSchema: _try(() => credentialSchemas[credentialSchemasCollections._ids[group.vCard.credentialSchema][0]], null), paymentSchema: _try(() => schemas[group.vCard.paymentSchema], null), procedure: _try(() => procedures[group.vCard.procedure], {}) }),
                  check: Object.assign({}, group.check, names, { credentialSchema: _try(() => credentialSchemas[credentialSchemasCollections._ids[group.check.credentialSchema][0]], null), paymentSchema: _try(() => schemas[group.check.paymentSchema], null), procedure: _try(() => procedures[group.check.procedure], {}) }),
                  ACH: Object.assign({}, group.ACH, names, { credentialSchema: _try(() => credentialSchemas[credentialSchemasCollections._ids[group.ACH.credentialSchema][0]], null), paymentSchema: _try(() => schemas[group.ACH.paymentSchema], null), procedure: _try(() => procedures[group.ACH.procedure], {}) }),
                };
              });
            }
          });
        } else {
          globalItems.byTag._none.groups[groupId] = group.name;
        }
      });

    Object.values(tags)
      .forEach((tag) => {
        const tagId = tag._id;
        const groupsInTag = _try(() => globalItems.byTag[tagId].groups, false);

        if (groupsInTag) {
          const vendorsInTag = _try(() => globalItems.byTag[tagId].vendors, false);
          if (!vendorsInTag) {
            globalItems.byVendor._none.tags[tagId] = tag.name;
          }
        } else {
          globalItems.byGroup._none.tags[tagId] = tag.name;
        }
      });

    return globalItems;
  }

);

export default selectors_csrGlobalItems;


