import { api } from 'api/_util/payclearlyapi';

function createTrip(organizationId, accountId, data) {
  return api().post(`/adhocTrips/${organizationId}/${accountId}`, _adaptTripToAPI(data));
}

function updateTrip(organizationId, accountId, id, data) {
  return api().patch(`/adhocTrips/${organizationId}/${accountId}/${id}`, _adaptTripToAPI(data, 'update'));
}

const scope = {
  createTrip,
  updateTrip,
};

export default scope;

// private helpers
function _adaptTripToAPI(data, action) {
  const ignoredValues = [
    'destinationCATERING',
    'destinationFUEL',
    'destinationFBO',
    'destinationHOTEL',
    'destinationTRANSPORTATION',
    'originCATERING',
    'originFUEL',
    'originFBO',
    'originHOTEL',
    'originTRANSPORTATION',
  ];
  let adapted = {};
  let arrivalRequestedServices = {};
  let departureRequestedServices = {};
  switch (action) {
    case 'update':
      adapted = { ...data };
      if (adapted.startDate) adapted.startDate = new Date(data.startDate).getTime();
      if (adapted.endDate) adapted.endDate = new Date(data.endDate).getTime();
      // Arrival Services
      arrivalRequestedServices = { CATERING: data.destinationCATERING, FUEL: data.destinationFUEL, FBO: data.destinationFBO, HOTEL: data.destinationHOTEL, TRANSPORTATION: data.destinationTRANSPORTATION };
      adapted.arrivalRequestedServices = parseRequestedServices(arrivalRequestedServices);
      // Departure Services
      departureRequestedServices = { CATERING: data.originCATERING, FUEL: data.originFUEL, FBO: data.originFBO, HOTEL: data.originHOTEL, TRANSPORTATION: data.originTRANSPORTATION };
      adapted.departureRequestedServices = parseRequestedServices(departureRequestedServices);
      // Clean up object
      ignoredValues.forEach((value) => delete adapted[value]);
      break;
    case 'create':
    default:
      adapted = { ...data };
      adapted.startDate = new Date(data.startDate).getTime();
      adapted.endDate = new Date(data.endDate).getTime();
      // Arrival Services
      arrivalRequestedServices = { CATERING: data.destinationCATERING, FUEL: data.destinationFUEL, FBO: data.destinationFBO, HOTEL: data.destinationHOTEL, TRANSPORTATION: data.destinationTRANSPORTATION };
      adapted.arrivalRequestedServices = parseRequestedServices(arrivalRequestedServices);
      // Departure Services
      departureRequestedServices = { CATERING: data.originCATERING, FUEL: data.originFUEL, FBO: data.originFBO, HOTEL: data.originHOTEL, TRANSPORTATION: data.originTRANSPORTATION };
      adapted.departureRequestedServices = parseRequestedServices(departureRequestedServices);
      // Clean up object
      ignoredValues.forEach((value) => delete adapted[value]);
      break;
  }

  return adapted;
}

function parseRequestedServices(services) {
  return Object.keys(services).reduce((acc, id) => {
    acc[id] = { _id: services[id] };
    return acc;
  }, {});
}
