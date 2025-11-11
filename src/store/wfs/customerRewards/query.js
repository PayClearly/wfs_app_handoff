const { CustomerRewards } = require('../schemas');

const query = `
  query customerRewards($customerNumber: Int!) {
    customerRewards(customerNumber: $customerNumber) ${CustomerRewards}
  }
`;

module.exports = query;
