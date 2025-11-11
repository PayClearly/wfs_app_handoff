const { Card } = require('../schemas');

export const query = `
  query cards($customerNumber: Int!, $tailNumber: String) {
    cards(customerNumber: $customerNumber, tailNumber: $tailNumber) {
      edges {
        node ${Card}
      }
    }
  }
`;

module.exports = query;
