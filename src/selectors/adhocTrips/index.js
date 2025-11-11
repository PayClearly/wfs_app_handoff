import createSelector from 'selector';


import Utils from 'utils';

// Internal Helper Functions ...

const selectors_adhocTrips = createSelector(
  (state) => state.wfs.adhocTrips.data.items,
  (state) => state.account.expenses.data.items,
  (state) => state.wfs.data.context.tailNumber,
  (state) => state.user.profile.data.item._id,
  (trips = {}, expenses = {}, tailNumber = '', userId = '') => {
    if (!tailNumber) { return {}; }
    return Object.values(trips).filter((tripAdhoc) => tripAdhoc.createdBy === userId && !tripAdhoc.deleted).reduce((acc, trip) => {
      acc[trip._id] = {
        id: trip.tripNumber,
        _id: trip._id,
        destinationIcao: trip.destinationICAO,
        originIcao: trip.originICAO,
        tailNumbers: [trip.tailNumber],
        expense: Object.values(expenses).reduce((acc2, curr2) => {
          if (curr2.tripNumber && Number.parseInt(curr2.tripNumber, 10) === Number.parseInt(trip.tripNumber, 10)) {
            return Number.parseFloat(Utils.addDollars([acc2, curr2.amount])).toFixed(2);
          }
          return acc2;
        }, 0.00),
        legs: [{
          id: trip.tripNumber,
          _id: trip._id,
          legNumber: 1,
          tailNumber: trip.tailNumber,
          arriveAirportLocal: new Date(trip.endDate),
          departAirportLocal: new Date(trip.startDate),
          toFlightLeg: { icao: trip.destinationICAO },
          fromFlightLeg: { icao: trip.originICAO },
          arrivalLogisticsServices: Object.entries(trip.arrivalRequestedServices || []),
          departLogisticsServices: Object.entries(trip.departureRequestedServices || []),
        }],
      };
      return acc;
    }, {});
  }
);

export default selectors_adhocTrips;

