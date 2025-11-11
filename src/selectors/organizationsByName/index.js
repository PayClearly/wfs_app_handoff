import createSelector from 'selector';


const selectors_organizationsByName = createSelector('selectors_organizationsByName',

  state => state.organizations.data.items,

  (organizations = {}) => {
    return Object.keys(organizations).reduce((acc, orgId) => {
      acc[organizations[orgId].name] = orgId;
      return acc;
    }, {});
  },
);

export default selectors_organizationsByName;
