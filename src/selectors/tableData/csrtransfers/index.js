import createSelector from 'selector';


// import Utils from 'utils';
import Selectors from 'selectors';

const selectors_tableData_csrtransfers = createSelector(

  state => state.account.achTransfers.data.items,
  state => state.account.opsNotes.data.items,
  state => Selectors.context(state),

  (transfers = {}, opsNotes = {}, context) => {
    const csrTransfersTableData = {};
    const refs = _getTransferRefsMap(transfers);
    const opsNotesMap = Object.keys(opsNotes).reduce((acc, val) => {
      const opNote = opsNotes[val];
      if (!acc[opNote.context]) {
        acc[opNote.context] = new Array({ ...opNote });
      } else {
        acc[opNote.context].push(opNote);
      }
      return acc;
    }, {});
    
    Object.keys(transfers).forEach((transferId) => {
      const transfer = transfers[transferId];

      let transferOpsNotes;
      if (opsNotesMap[`achTransfers/${context.organizationId}/${context.accountId}/${transferId}`]) {
        transferOpsNotes = opsNotesMap[`achTransfers/${context.organizationId}/${context.accountId}/${transferId}`];
      }
      
      csrTransfersTableData[transferId] = {
        ...transfer,
        transferAmount: transfer.amount.value || 0,
        _ref: refs[transferId],
        opsNotes: transferOpsNotes,
      };
    });
    
    return csrTransfersTableData;
  }

);

export default selectors_tableData_csrtransfers;

// Internal Helper Functions ... 
// transfers dont have refs, so we order them by created at and glean the ref from that for the chip
const _getTransferRefsMap = (transfers) => {
  const sorted = Object.keys(transfers);
  sorted.sort((a, b) => {
    if (a.createdAt < b.createdAt) return -1;
    if (a.createdAt > b.createdAt) return 1;
    return 0;
  });
  return sorted.reduce((acc, cur, i) => {
    acc[cur] = i + 1;
    return acc;
  }, {});
};

// GENERATOR_TYPE='selector';
