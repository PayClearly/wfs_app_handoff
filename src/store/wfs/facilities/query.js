const { Facility } = require('../schemas');

const query = `
  query facilities($icaos: [String!]!) {
    facilitiesByIcaos(icaos: $icaos) {
      edges {
        node ${Facility}
      }
    }
  }
`;

module.exports = query;
