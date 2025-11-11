import createSelector from 'selector';


// Third Party Imports ...

// import Utils from 'utils';
// import Selectors from 'selectors';

const selectors_fileTypeOptions = createSelector('selectors_fileTypeOptions',
  () => {
    return {
      csv: { display: 'Default (.csv)' },
      comdata: { display: 'COMDATA' },
      rubicon: { display: 'Rubicon' },
      wexap3: { display: 'Wex AP3' },
      bpam: { display: 'BPAM' },
    };
  }
);

export default selectors_fileTypeOptions;


