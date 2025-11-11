/* eslint no-useless-escape:0 */

import createSelector from 'selector';

const selectors_vendorsByGroup = createSelector('selectors_vendorsByGroup',
  state => state.global.vendors.data.items,
  (vendors = {}) => {

    return Object.keys(vendors)
    .reduce((acc, vendorId) => {
      const vendor = vendors[vendorId];
      const groupIds = vendor.groupIds || [];
      if (groupIds.length) {
        groupIds.forEach((groupId) => {
          acc[groupId] = acc[groupId] || {};
          acc[groupId][vendorId] = vendor.name;
        });
      } else {
        acc._none[vendorId] = vendor.name;
      }
      return acc;
    }, { _none: {} });
  }
);

export default selectors_vendorsByGroup;

