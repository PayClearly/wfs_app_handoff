const { TripDetail } = require('../schemas');

const query = `
  query trips($customerNumber: Int!, $tailNumber: String, $first: Int, $after: String) {
    trips(customerNumber: $customerNumber, tailNumber: $tailNumber, first: $first, after: $after) {
      edges {
        node {
          tripNumber
          tripDetail ${TripDetail}
        }
        cursor
      }
    }
  }
`;

module.exports = query;
