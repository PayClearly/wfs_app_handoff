const { Tail } = require('../schemas');

const query = `
  query tailsForWallet($customerNumber: Int!) {
    tailsForWallet(customerNumber: $customerNumber) {
      edges {
        node ${Tail}
      }
    }
  }
`;

module.exports = query;
