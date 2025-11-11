import createSelector from 'selector';


// Third Party Imports ...


const selectors_opsNotesDenormalized = createSelector('selectors_opsNotesDenormalized',

  state => state.account.opsNotes.data.items,

  (opsNotes = {}) => {
    return Object.values(opsNotes).reduce((acc, opsNote) => {
      if (acc[opsNote.context]) acc[opsNote.context].push(opsNote);
      else acc[opsNote.context] = [opsNote];
      return acc;
    }, {});
  }
);

export default selectors_opsNotesDenormalized;
