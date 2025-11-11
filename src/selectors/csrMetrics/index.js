// import createSelector from 'selector';


// // Third Party Imports ...

// // import Utils from 'utils';
// import Selectors from 'selectors';

// const selectors_csrMetrics = createSelector('selectrors_csrMetrics',

//   state => state.global.vendors.data.items,
//   state => state.global.groups.data.items,
//   state => state.global.tags.data.items,

//   (globalVendors, globalVendorGroups, csrGlobalItems, tags) => {
//     if (!Object.keys(tags).length || !Object.keys(csrGlobalItems.vendorTagToPSOP).length) return {};
//     const globalVendorIds = Object.keys(globalVendors || {});
//     const activeGlobalVendors = globalVendorIds.filter((vendorId) => {
//       const globalVendor = globalVendors[vendorId];
//       return globalVendor.active;
//     });
//     const activeGlobalVendorCount = activeGlobalVendors.length;

//     const defaultGroups = [];
//     const activeGroupNonDefaultCount = Object.keys(globalVendorGroups || {})
//     .reduce((acc, groupId) => {
//       const group = globalVendorGroups[groupId];
//       if (_try(() => group.name.includes('Default'))) {
//         defaultGroups.push(groupId);
//         return acc;
//       }
//       if (group) {
//         return acc + (group.active ? 1 : 0);
//       }
//       return acc;
//     }, 0);

//     const vendorsLinkedToDefaultGroups = defaultGroups.reduce((acc, groupId) => {
//       const vendors = _try(() => csrGlobalItems.byGroup[groupId].vendors, {});
//       return Object.assign({}, acc, vendors);
//     }, {});
//     const activeVendorsLinkedToDefaultGroups = Object.keys(vendorsLinkedToDefaultGroups).filter(vendorId => globalVendors[vendorId].active);
//     const totalGlobalVendorsLinkedToNonDefaultGroupsCount = activeGlobalVendorCount - Object.keys(_try(() => csrGlobalItems.byGroup._none.vendors, {})).length - activeVendorsLinkedToDefaultGroups.length;

//     const exportData = [];
//     activeGlobalVendors.forEach((vendorId) => {
//       const globalVendor = globalVendors[vendorId];

//       _try(() => globalVendor.groupIds, []).forEach((groupId) => {
//         if (defaultGroups.includes(groupId)) return;
//         if (!globalVendorGroups[groupId].active) return;

//         if (_try(() => globalVendorGroups[groupId].tagIds.length)) {
//           const tagNames = globalVendorGroups[groupId].tagIds.reduce((acc, tagId) => {
//             if (!acc) return tags[tagId].name;

//             return `${acc}/${tags[tagId].name}`;
//           }, '');

//           const methods = {};
//           Object.keys(csrGlobalItems.vendorTagToPSOP[vendorId][globalVendorGroups[groupId].tagIds[0]] || {}).forEach((method) => {
//             if (method === 'groupId') return;
//             methods[method] = Boolean(csrGlobalItems.vendorTagToPSOP[vendorId][globalVendorGroups[groupId].tagIds[0]][method].accepts);
//           });

//           exportData.push({
//             name: globalVendor.name.replace(/,/g, '/'),
//             vendorId,
//             globalVendorGroupId: groupId,
//             groupName: globalVendorGroups[groupId].name.replace(/,/g, '/'),
//             tagName: tagNames,
//             ...methods,
//           });
//         }
//       });
//     });

//     return {
//       activeGlobalVendorCount,
//       activeGroupNonDefaultCount,
//       totalGlobalVendorsLinkedToNonDefaultGroupsCount,
//       defaultGroups,
//       exportData,
//     };
//   }
// );

// export default selectors_csrMetrics;

// // Internal Helper Functions ... 

// // GENERATOR_TYPE='selector';
