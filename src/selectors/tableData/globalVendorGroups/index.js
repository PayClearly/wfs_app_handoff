import createSelector from 'selector';


import Selectors from 'selectors';

const selectors_tableData_globalVendorGroups = createSelector(

  state => state.global.groups.data.items,
  state => Selectors.vendorsByGroup(state),
  state => state.global.tags.data.items,

  (globalVendorGroups = {}, vendorsByGroup = {}, tags = {}) => {
    const globalVendorGroupTableData = {};

    Object.keys(globalVendorGroups).forEach((globalVendorGroupId) => {
      const globalVendorGroup = globalVendorGroups[globalVendorGroupId];

      const tagNames = (globalVendorGroup.tagIds || []).reduce((acc, tagId) => {
        const tag = tags[tagId] || {};
        const name = tag.name;

        if (!acc) return name;
        return `${acc}, ${name}`;
      }, '');
      const vendorCount = _try(() => {
        return Object.keys((vendorsByGroup || {})[globalVendorGroupId]).length;
      }) || 0;

      const globalVendorIds = vendorsByGroup[globalVendorGroupId] || {};
      const globalVendorNames = Object.values(globalVendorIds).reduce((acc, vendorName) => {
        if (!acc) return vendorName;
        return `${acc}, ${vendorName}`;
      }, '');

      const accepts = {
        vCard: _try(() => globalVendorGroup.vCard.accepts, false),
        check: _try(() => globalVendorGroup.check.accepts, false),
        ACH: _try(() => globalVendorGroup.ACH.accepts, false),
      };

      globalVendorGroupTableData[globalVendorGroupId] = {
        ...globalVendorGroup,
        tagNames: tagNames || '-',
        vendorCount,
        globalVendorNames,
        accepts,
      };
    });

    return globalVendorGroupTableData;
  }

);

export default selectors_tableData_globalVendorGroups;


