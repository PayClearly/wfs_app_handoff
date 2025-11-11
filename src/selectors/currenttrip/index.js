import createSelector from 'selector';



const selectors_currenttrip = createSelector('selectors_currenttrip',
  state => state.wfs.trips.data,
  state => state.wfs.data.context,
  (trips = {}, context = {}) => {
    const upcomingLegs = Object.values(trips).reduce((acc, { tripDetail } = { legDetails: [] }) => {
      tripDetail.legDetails.forEach((leg) => {
        const arrivalTime = Date.parse(leg.arriveUtc);
        const now = Date.now();
        if (arrivalTime - now > 0 && leg.tailNumber === context.tailNumber) {
          leg.tripNumber = tripDetail.tripNumber;
          leg.timeUntil = arrivalTime - now;
          acc.push(leg);
        }
      });

      return acc;
    }, []);

    upcomingLegs.sort((legA, legB) => {
      return legA.timeUntil - legB.timeUntil;
    });

    return {
      trip: upcomingLegs.length ? trips[upcomingLegs[0].tripNumber] : undefined,
      leg: upcomingLegs.length ? upcomingLegs[0] : undefined,
    };
  }
);

export default selectors_currenttrip;


