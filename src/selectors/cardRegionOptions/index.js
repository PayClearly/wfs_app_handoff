import createSelector from 'selector';


// Third Party Imports ...


const selectors_cardRegionOptions = createSelector('selectors_cardRegionOptions',
  () => {
    return {
      USA: {
        display: 'United States',
      },
      CAN: {
        display: 'Canada',
      },
      USC: {
        display: 'United States and Canada',
      },
      INT: {
        display: 'International',
      },
      NAM: {
        display: 'North America',
      },
    };
  }
);

export default selectors_cardRegionOptions;


