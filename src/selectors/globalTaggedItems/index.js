import createSelector from 'selector';


// Third Party Imports ...


const selectors_globalTaggedItems = createSelector('selectors_globalTaggedItems',

  state => state.account.globalVendors.data.items,
  state => state.account.globalVendors.data.loadedTags,
  state => state.global.groups.data.items,
  state => state.global.schemas.data.items,
  state => state.global.credentialSchemas,
  state => state.global.tags.data.items,
  state => state.account.paymentPipelinePreferences.data.item.globalVendorTagIds,
  state => state.account.paymentPipelinePreferences.status.fetched,

  (accountGlobalVendors = {}, loadedTags = {}, globalVendorGroups = {}, schemas = {}, credentialSchemas = {}, tags = {}, accountTagIds = [], paymentPipelinePreferencesFetched = false) => {

    const _credentialSchemas = {};
    const _paymentSchemas = {};
    const vendors = {};
    const vendorNamesToId = {};
    const allTagsLoaded = paymentPipelinePreferencesFetched && accountTagIds.every(tagId => loadedTags[tagId]);

    if (allTagsLoaded) {
      Object.keys(accountGlobalVendors).forEach((globalVendorId) => {
        const accountGlobalVendor = accountGlobalVendors[globalVendorId];
        vendors[globalVendorId] = {
          ...accountGlobalVendor,
          tags: {},
        };
        vendorNamesToId[accountGlobalVendor.name] = globalVendorId;

        Object.keys(accountGlobalVendor.tags || {})
          .forEach((tagId) => {

            const groupId = accountGlobalVendor.tags[tagId];
            const group = globalVendorGroups[groupId];

            // Ingnore if this tag is not accepted by the account
            if (accountTagIds.indexOf(tagId) < 0) return;
            // Ingore if the group does not accpet apyment at all
            if (!group || !_groupAcceptsPayment(group)) return;
            ['vCard', 'ACH', 'check'].forEach((method) => {
              const PSOP = { ...(group[method] || {}) };

              const credSchema = _try(() => credentialSchemas.data.items[credentialSchemas.collections._ids[PSOP.credentialSchema][0]]) || {};
              if (credSchema && credSchema.active) {
                _credentialSchemas[PSOP.credentialSchema] = {
                  ...credSchema,
                  name: (credSchema.name !== 'none' && credSchema.name) || (group && group.name),
                };
              }
              PSOP.credentialSchemas = credSchema;

              const paySchema = schemas[PSOP.paymentSchema] || {};
              if (paySchema && paySchema.active) { _paymentSchemas[PSOP.paymentSchema] = { ...paySchema }; }

              vendors[globalVendorId].tags[tagId] = vendors[globalVendorId].tags[tagId] || {};
              vendors[globalVendorId].tags[tagId][method] = {
                display: method,
                accepts: PSOP.accepts || PSOP.accepted,
                ...PSOP,
                credentialSchema: credSchema,
                paymentSchema: paySchema,
              };

            });
          });

        vendors[globalVendorId].selectableTags = Object.keys(vendors[globalVendorId].tags)
          .reduce((acc, tagId) => {

            const tag = tags[tagId];
            acc[tag.name] = {
              display: tags[tagId].name,
              id: tagId,
            };

            // add the aliases as options as well
            (tag.aliases || [])
              .forEach((alias) => {
                acc[`${alias}`] = {
                  display: `${tag.name} (${alias})`,
                  id: tagId,
                };
              });

            return acc;
          }, {});

      }, {});
    }
    return {
      credentialSchemas: _credentialSchemas,
      vendors,
      paymentSchemas: _paymentSchemas,
      vendorNamesToId,
      activeVendorOptions: Object.values(vendors).filter(globalVendor => globalVendor.active),
      allTagsLoaded,
    };

  }
);

export default selectors_globalTaggedItems;


//       ...acc,
//     };
//   }, { vCard: false, ACH: false, check: false })).some(accepts => accepts);
// }
function _groupAcceptsPayment(group = {}) {
  return _try(() => group.vCard.accepts || group.vCard.accepted || group.ACH.accepts || group.ACH.accepted || group.check.accepts || group.check.accepted);
}

