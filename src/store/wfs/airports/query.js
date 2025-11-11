const { Airport } = require('../schemas');

const query = `
  query airportsByIcaos($icaos: [String!]!) {
    airportsByIcaos(icaos: $icaos) {
      edges {
        node ${Airport}
      }
    }
  }
`;

module.exports = query;
