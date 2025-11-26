import createSelector from 'selector';

// Third Party Imports ...

const selectors_fileTypeOptions = createSelector('selectors_fileTypeOptions',
  () => {
    return {
      csv: { display: 'Default (.csv)' },
      wexap3: { display: 'Wex AP3' },
      bpam: { display: 'BPAM' },
    };
  }
);

export default selectors_fileTypeOptions;

