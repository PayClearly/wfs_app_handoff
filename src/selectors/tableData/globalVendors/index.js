import createSelector from 'selector';



const selectors_tableData_globalVendors = createSelector(

  state => state.global.vendors.data.items,
  state => state.global.groups.data.items,
  state => state.global.tags.data.items,

  (globalVendors = {}, globalGroups = {}, globalTags) => {
    const globalVendorsTableData = {};

    Object.keys(globalVendors).forEach((globalVendorId) => {
      const globalVendor = globalVendors[globalVendorId];

      // format group names
      const groupNames = (globalVendor.groupIds || []).reduce((acc, groupId) => {
        const group = globalGroups[groupId] || {};
        const name = group.name;

        if (!acc) return name;
        return `${acc}, ${name}`;
      }, '');

      const tagIds = (globalVendor.groupIds || []).reduce((acc, groupId) => {
        const group = globalGroups[groupId] || {};
        const tags = group.tagIds || [];
        acc = [...acc, ...tags];
        return acc;
      }, []);

      const groupTags = tagIds.reduce((acc, tagId) => {
        const tag = globalTags[tagId];
        const name = tag.name;
        if (!acc) return name;
        return `${acc}, ${name}`;
      }, '');

      globalVendorsTableData[globalVendorId] = {
        ...globalVendor,
        groupNames,
        groupTags,
      };

    });

    return globalVendorsTableData;
  }

);

export default selectors_tableData_globalVendors;


