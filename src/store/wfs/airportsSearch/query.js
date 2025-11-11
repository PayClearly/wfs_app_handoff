const { Airport } = require('../schemas');

const query = `
  query searchAirports($search: String!) {
    searchAirports(search: $search) {
      edges {
        node ${Airport}
      }
    }
  }
`;

module.exports = query;
