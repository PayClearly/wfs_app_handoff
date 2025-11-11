const { SO } = require('../schemas');

const query = `
  query salesOrderByCustomer($SalesOrderInput: SalesOrderInput, $SalesOrderOrderByInput: SalesOrderOrderByInput, $after: String, $first: Int) {
    salesOrderByCustomer(filterBy: $SalesOrderInput, orderBy: $SalesOrderOrderByInput, first: $first, after: $after) {
      edges {
        node ${SO}
        cursor
      }
    }
  }
`;

module.exports = query;
