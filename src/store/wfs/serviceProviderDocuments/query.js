const { Document } = require('../schemas');

const query = `
  query serviceProviderDocuments($DocumentInput: DocumentInput, $ServiceProviderDocumentOrderByInput: ServiceProviderDocumentOrderByInput, $first: Int, $after: String){
    serviceProviderDocuments(filterBy: $DocumentInput, orderBy: $ServiceProviderDocumentOrderByInput, first: $first, after: $after) {
      edges {
        node ${Document}
        cursor
      }
    }
  }
`;

module.exports = query;
