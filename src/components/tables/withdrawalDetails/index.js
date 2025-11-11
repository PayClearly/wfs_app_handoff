import { connect, Component, bindActionCreators, Fragment } from 'component';
// import Utils from 'utils';
// import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import numeral from 'numeral';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    paymentStatuses: state.account.paymentStatuses.data.items,
    accountVendors: state.account.accountVendors.data.items,
    opsNotes: state.account.opsNotes.data.items,
    vCards: state.account.cardsIntegration.data.resources.vCards,
    clears: state.account.cardsIntegration.data.resources.clears,
    auths: state.account.cardsIntegration.data.resources.auths,
    // filteredAndSortedItems: Selectors.tableItems('Components.tables.paymentIssues', props.tableKey, 'Selectors.tableData.paymentIssues(state)')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_tables_paymentIssues extends Component {

  state = {
    columns: [
      { label: 'Refund Type', dataKey: 'refundType', sortable: true, default: 'Unknown', cellRenderer: data => data },
      { label: 'Refund Amount', dataKey: 'amount', sortable: true, default: 'Unknown', cellRenderer: formatAmount, exportFormatter: formatAmount },
      { label: 'Merchant', dataKey: 'vendorName', sortable: true, default: 'Unknown', cellRenderer: data => data },
      { label: 'Card Number Last Four', dataKey: 'cardNumberLastFour', sortable: true, default: 'Unknown', cellRenderer: data => `*${data}`, exportFormatter: data => `*${data}` },
      { label: 'Supplier Refund Date', dataKey: 'supplierRefundedAt', sortable: true, default: 'Unknown', cellRenderer: data => data },
      { label: 'Payment Reference', dataKey: 'paymentReference', sortable: true, default: 'Unknown', cellRenderer: data => data },
      { label: 'Payment Creation Date', dataKey: 'paymentCreatedAt', sortable: true, default: 'Unknown', cellRenderer: data => data },
      { label: 'Original Amount', dataKey: 'originalAmount', sortable: true, default: 'Unknown', cellRenderer: formatAmount, exportFormatter: formatAmount },
      { label: 'Details', dataKey: 'details', sortable: true, default: 'Unknown', cellRenderer: data => data },
      { label: 'Refund Reason', dataKey: 'refundReason', sortable: true, default: 'Unknown', cellRenderer: data => data },
    ],
  };




  render() {
    const { columns } = this.state;
    const items = getWithdrawalTrackerData(this.props);

    return (
      <div className="components_tables_withdrawalDetails">
        <Components.tables.components.collapsibleTable
          {...this.props}
          enableExportCSV
          exportName="Refunds"
          tableName="Components.tables.withdrawalDetails"
          tableKey={this.props.tableKey}
          data={{
            items,
            count: _try(() => Object.keys(items).length, 0),
          }}
          defaultTableState={{
            sort: {
              sortKey: 'paymentReference',
              orderIn: 'desc',
            },
          }}
          itemOrder={Object.keys(items)}
          columns={columns}
          typeForNoDataText="Withdrawals"
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_tables_paymentIssues);

// Internal Helper Functions ...
const _isMissingFrontZero = lastFour => `${lastFour[0]}0${lastFour.slice(1)}`;

function formatAmount(amount) {
  return (amount) ? numeral(amount).format('$0,0.00') : null;
}

function codeMap(code) {
  return {
    1: 'Funds Remaining',
    2: 'Supplier Direct Refund',
    3: 'Payment Cancelled',
  }[code];
}

function getWithdrawalTrackerData(props) {
  return Object.entries(props.paymentIssues)
    .reduce((rows, [id, paymentIssue]) => {
      const payment = props.paymentStatuses[paymentIssue.paymentId]
        || props.paymentStatuses[handleIssuesWithOldPaymentIds(props.paymentStatuses, paymentIssue)];

      const vendor = props.accountVendors[payment.created.vendorId];

      const amount = paymentIssue.amount;

      const vendorName = vendor.displayName
        && vendor.displayName !== vendor.name
        && `${vendor.displayName} (${vendor.name})`
        || vendor.name;

      const details = Object.values(payment.created.customFields || {}).join(' ');
      const paymentReference = `P_${payment._ref}`;
      const paymentCreatedAt = new Date(payment.created._at).toLocaleDateString();
      const originalAmount = payment.created.amount;

      const latestOpsNote = Object.values(props.opsNotes || {}).find((note) => {
        const { context } = note;
        const paymentId = context.split('/')[3];

        return paymentId === paymentIssue.paymentId;
      }) || {};

      const refundReason = latestOpsNote.message || '';

      const fundsRemainingData = () => {
        const cardIds = Object.values(payment.funded.vCards || {})
          .map(card => card.id);

        if (!cardIds.length) {
          return {
            cardNumberLastFour: 'N/A',
          }
        }

        const init = cardIds.reduce((map, cardId) => {
          return {
            ...map,
            [cardId]: 0,
          };
        }, {});

        const cardIdToClearedAmount = Object.values(props.clears)
          .reduce((map, clear) => {
            if (cardIds.includes(clear.cardId)) {
              return {
                ...map,
                [clear.cardId]: map[clear.cardId] + clear.amount,
              };
            }
            return map;
          }, init);

        const matchingCardId = Object.keys(cardIdToClearedAmount)
          .find(cardId => cardIdToClearedAmount[cardId] + amount === originalAmount);

        if (!matchingCardId) return {};

        const cardNumberLastFour = (props.vCards[matchingCardId] || {}).cardNumberLastFour;

        return { cardNumberLastFour };
      };

      const supplierDirectData = () => {
        const cardIds = Object.values(payment.funded.vCards)
          .map(card => card.id);

        const clears = Object.values(props.clears)
          .filter(clear => cardIds.includes(clear.cardId));

        const matchingClear = clears.find(clear => clear.amount === (-1) * amount);

        if (!matchingClear) {
          const auths = Object.values(props.auths)
            .filter(auth => cardIds.includes(auth.cardId));

          const matchingAuth = auths.find(auth => auth.amount === (-1) * amount);

          if (!matchingAuth) return {};

          const note = `Matching auth for refund amount '${amount}' was found without a matching clear`;

          const cardNumberLastFour = (props.vCards[matchingAuth.cardId] || {}).cardNumberLastFour;
          const supplierRefundedAt = new Date(matchingAuth.at).toLocaleDateString();

          return {
            cardNumberLastFour,
            supplierRefundedAt,
            refundReason: `${note}. ${refundReason}`,
          };
        }

        const matchingCard = props.vCards[matchingClear.cardId];

        const cardNumberLastFour = matchingCard.cardNumberLastFour;
        const supplierRefundedAt = new Date(matchingClear.at).toLocaleDateString();

        return { cardNumberLastFour, supplierRefundedAt };
      };

      const code = paymentIssue.code;

      const row = {
        amount,
        vendorName,
        details,
        paymentReference,
        paymentCreatedAt,
        originalAmount,
        refundReason,
        refundType: codeMap(code),
      };

      if (paymentIssue.code === '1') return { ...rows, [id]: { ...row, ...fundsRemainingData() } };
      if (paymentIssue.code === '2') return { ...rows, [id]: { ...row, ...supplierDirectData() } };
      // if (paymentIssue.code === '3') return { ...rows, [id]: { ...row, ...cancelledPaymentData() } };
      return { ...rows, [id]: row };
    }, {});
}

function handleIssuesWithOldPaymentIds(paymentStatuses, paymentIssue) {
  const { _id } = Object.values(paymentStatuses).find(paymentStatus => paymentStatus._oldId === paymentIssue.paymentId);
  return _id;
}
