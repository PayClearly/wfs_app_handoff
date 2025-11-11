import createSelector from 'selector';

// Third Party Imports ...

// import Utils from 'utils';
// import Selectors from 'selectors';

const selectors_unlinkedTransfers = createSelector(

  state => state.account.achTransfers.data.items,
  state => state.account.achTransfers.status.fetched,

  (transfers = {}, fetched) => {
    if (!fetched) return null;

    // let paymentsPendingLinkToTransfer;
    let pCardChangeRequestsPendingLinkToTransfer;

    Object.keys(transfers).forEach((transferId) => {
      const transfer = transfers[transferId];
      // if (transfer._waitingToLinkToPayments && transfer.status !== 'cancelled') {
      //   paymentsPendingLinkToTransfer = { ...paymentsPendingLinkToTransfer, ...transfer._forPayments };
      // }
      if (transfer._waitingToLinkToPCardChangeRequests && transfer.status !== 'cancelled') {
        pCardChangeRequestsPendingLinkToTransfer = { ...pCardChangeRequestsPendingLinkToTransfer, ...transfer._forPCardChangeRequests };
      }
    });

    return {
      pCardChangeRequestsPendingLinkToTransfer,
    };
  }

);

export default selectors_unlinkedTransfers;


