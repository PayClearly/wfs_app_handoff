import createSelector from 'selector';


// import Utils from 'utils';
import Selectors from 'selectors';

const selectors_tableData_accountvendorcredentials = createSelector(

  state => Selectors.globalTaggedItems(state).credentialSchemas,
  state => state.account.accountVendorCredentials.data.items,

  (vendorCredentialSchemas = {}, accountVendorCredentials = {}) => {
    const accountVendorCredentialsTableData = {};

    Object.keys(vendorCredentialSchemas).forEach((schemaId) => {
      const schema = vendorCredentialSchemas[schemaId];
      accountVendorCredentialsTableData[schemaId] = {
        ...schema,
        hasValidCreds: Boolean(accountVendorCredentials && accountVendorCredentials[schemaId]),
      };
    });

    return accountVendorCredentialsTableData;
  }

);

export default selectors_tableData_accountvendorcredentials;


