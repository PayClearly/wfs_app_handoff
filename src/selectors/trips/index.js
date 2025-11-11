import createSelector from 'selector';


import Utils from 'utils';
// import Selectors from 'selectors';

// TODO: Make expenses have collections on tripNumbers?
const selectors_trips = createSelector(
  state => state.wfs.trips.data,
  state => state.account.expenses.data.items,
  (trips = {}, expenses = {}) => {
    return Object.values(trips).reduce((acc, trip) => {
      acc[trip.tripNumber] = {
        ...trip,
        id: trip.tripNumber,
        tailNumbers: _getTailNumbers(trip.tripDetail.legDetails),
        expense: Object.values(expenses).reduce((acc2, curr2) => {
          if (curr2.tripNumber && Number.parseInt(curr2.tripNumber, 10) === Number.parseInt(trip.tripNumber, 10)) return Number.parseFloat(Utils.addDollars([acc2, curr2.amount])).toFixed(2);
          return acc2;
        }, 0.00),
        legs: trip.tripDetail.legDetails.map((leg) => {
          return {
            ...leg,
          };
        }),
      };
      return acc;
    }, {});
  }
);

export default selectors_trips;

// Internal Helper Functions ...

const _getTailNumbers = (legs) => {
  return legs.reduce((acc, { tailNumber }) => {
    if (!acc.includes(tailNumber)) acc.push(tailNumber);
    return acc;
  }, []);
};

// GENERATOR_TYPE='selector';
