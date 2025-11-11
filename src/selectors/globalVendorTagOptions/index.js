import createSelector from 'selector';

// Third Party Imports ...

// import Utils from 'utils';
// import Selectors from 'selectors';

const selectors_globalVendorTagOptions = createSelector(
  state => state.global.tags.data.items,
  (tags) => {
    return Object.keys(tags || {})
      .reduce((acc, id) => {
        acc[id] = { display: tags[id].name, id };
        return acc;
      }, {});
  }
);

export default selectors_globalVendorTagOptions;


