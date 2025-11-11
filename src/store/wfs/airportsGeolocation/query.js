const { AirportWithLocation } = require('../schemas');

const query = `
  query airportsByLatLong($latitude: Float!, $longitude: Float!, $radius: Int) {
    airportsByLatLong(latitude: $latitude, longitude: $longitude, radius: $radius) {
      edges {
        node ${AirportWithLocation}
      }
    }
  }
`;

module.exports = query;
