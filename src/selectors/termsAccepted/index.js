import createSelector from 'selector';

const selectors_termsAndConditions = createSelector('selectors_termsAndConditions',

  state => state.user.privateMetadata.data.item.lastTAndCAccept,
  state => state.termsAndConditions.data.items._latest,
  state => state.user.privateMetadata.status.fetched,
  state => state.termsAndConditions.status.fetched,
  
  (acceptedDate, latestTermsDate, acceptedDateFetched, latestTermsDateFetched) => {
    if (!acceptedDateFetched || !latestTermsDateFetched) return undefined;
    return (acceptedDate)
      ? acceptedDate >= latestTermsDate
      : false;
  }
);

export default selectors_termsAndConditions;

// GENERATOR_TYPE='selector';
