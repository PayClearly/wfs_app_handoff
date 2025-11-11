import createSelector from 'selector';

// Third Party Imports ...


const selectors_csrGlobalItemsFetched = createSelector('selectors_csrGlobalItemsFetched',

  state => state.global.vendors.status.fetched && !state.global.vendors.status.fetching,
  state => state.global.groups.status.fetched && !state.global.groups.status.fetching,
  state => state.global.tags.status.fetched && !state.global.tags.status.fetching,
  state => state.global.schemas.status.fetched && !state.global.schemas.status.fetching,
  state => state.global.credentialSchemas.status.fetched && !state.global.credentialSchemas.status.fetching,
  state => state.global.procedures.status.fetched && !state.global.procedures.status.fetching,
  state => state.appConfig.data.metadata.name === 'ops',

  (vendorsFetched = false, groupsFetched = false, tagsFetched = false, schemasFetched = false, credentialSchemasFetched = false, proceduresFetched = false, isOps) => {
    return isOps || (vendorsFetched && groupsFetched && tagsFetched && schemasFetched && credentialSchemasFetched && proceduresFetched);
  }
);

export default selectors_csrGlobalItemsFetched;


