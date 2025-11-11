/* eslint no-useless-escape:0 */

import createSelector from 'selector';


const PSOPMetricsSelector = createSelector(

  state => state.global.vendors.data.items,
  state => state.global.groups.data.items,

  (globalVendors, globalVendorGroups) => {
    const activeGlobalVendorCount = Object.keys(globalVendors || {})
    .reduce((acc, vendorId) => {
      const vendor = globalVendors[vendorId];
      if (vendor) {
        return acc + (vendor.active ? 1 : 0);
      }
      return acc;
    }, 0);

    const activePSOPcount = Object.keys(globalVendorGroups || {})
    .reduce((acc, groupId) => {
      const PSOP = globalVendorGroups[groupId];
      if (PSOP) {
        return acc + (PSOP.active ? 1 : 0);
      }
      return acc;
    }, 0);
    
    const vendorsByGroup = Object.keys(globalVendors || {})
    .reduce((acc, vendorId) => {
      const vendor = globalVendors[vendorId];
      const groupId = vendor.groupId;
      if (groupId) {
        acc[groupId] = acc[groupId] || {};
        acc[groupId][vendorId] = vendor.name;
      } else {
        acc.default[vendorId] = vendor.name;
      }
      return acc;
    }, { default: {} });

    const totalVendorsLinkedToPSOPsCount = Object.keys(vendorsByGroup)
    .reduce((acc, groupId) => {
      if (groupId === 'default') return acc;

      return acc + Object.keys(vendorsByGroup[groupId]).length;
    }, 0);

    return {
      activeGlobalVendorCount,
      activePSOPcount,
      vendorsByGroup,
      totalVendorsLinkedToPSOPsCount,
    };
  },
);

export default PSOPMetricsSelector;
