import createSelector from 'selector';

// Third Party Imports ...


const selectors_context = createSelector(

  state => state.wfs.tails.collections.customerIds,
  state => state.wfs.customers.data,

  (tails = {}, customers = {}) => {
    return Object.keys(customers).reduce((acc, key) => {
      const customerName = customers[key].customerName;
      acc[customerName] = tails[key];
      return acc;
    }, {});
  }

);

export default selectors_context;


