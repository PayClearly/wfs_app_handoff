const { OFA } = require('../schemas');

const query = `
  query ofas($OfaInput: OfaInput, $OfaOrderBy: OfaOrderByInput, $first: Int, $after: String) {
    ofas(filterBy: $OfaInput, orderBy: $OfaOrderBy, first: $first, after: $after){
      edges {
        node ${OFA}
        cursor
      }
    }
  }
`;

module.exports = query;
