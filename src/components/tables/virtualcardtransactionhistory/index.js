import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';

import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  paymentStatuses: state.account.paymentStatuses.data.items,
  canRead: _try(() => Selectors.entity('cardsIntegration_idOrganization_idAccount')(state).canRead),
  cardTransactions: _try(() => Selectors.cardsActivity(state).cardTransactions, {}),
  filteredAndSortedItems: Selectors.tableItems('Components.tables.virtualcardtransactionhistory', props.tableKey, 'Selectors.cardsActivity(state).cardTransactions')(state),
});

const mapDispatchToProps = (dispatch, props) => ({});

class components_tables_virtualcardtransactionhistory extends Component {
  state = {
    columns: [
      {
        label: 'Card', dataKey: 'cardNumberLastFour', sortable: true, cellRenderer: (lastFour) => ((lastFour.length < 5) ? _isMissingFrontZero(lastFour) : lastFour), exportFormatter: (cardNumber) => ((cardNumber.length < 5) ? _isMissingFrontZero(cardNumber) : cardNumber),
      },
      {
        label: 'Date', dataKey: 'at', sortable: true, cellRenderer: (at) => Utils.dates.dateToDay(at), exportFormatter: Utils.dates.dateToDay,
      },
      {
        label: 'Amount', dataKey: 'amount', sortable: true, cellRenderer: (amount) => ((amount === undefined || amount === null) ? 'N/A' : Utils.numeral()(amount).format('$0,0.00')), exportFormatter: (amount) => ((amount === undefined || amount === null) ? 'N/A' : Utils.numeral()(amount).format('$0,0.00')),
      },
      {
        label: 'Type', dataKey: 'type', sortable: true, cellRenderer: (type) => <Components.badges.transactiontype type={type} />, exportFormatter: _transactionType,
      },
      {
        label: 'Tag', dataKey: 'refId', sortable: false, cellRenderer: (refId, transactionId) => (refId ? <Components.chip key={transactionId} refId={refId} /> : <span />), exportFormatter: (refId) => _paymentIdToRefNumber(refId, this.props.paymentStatuses),
      },
      {
        label: 'Authorization Code', dataKey: 'authCode', sortable: false, disableRender: true,
      },
      {
        label: 'Merchant', dataKey: 'merchantName', sortable: false, disableRender: true,
      },
    ],
  };





  rowRenderer = (rowId, rowData, expanded) => (
    <div className="p-4">
      <Components.overviews.cardtransactions data={rowData} />
    </div>
  );

  render() {
    const {
      canRead,
      cardTransactions,
      filteredAndSortedItems,
    } = this.props;
    if (!canRead) { return null; }

    return (
      <Fragment>
        {!this.props.hideTitle && <h2 className="card-title mb-3">Transactions</h2>}
        <Components.tables.components.multiFilter
          tableName="Components.tables.virtualcardtransactionhistory"
          tableKey={this.props.tableKey || 'default'}
          filterConfig={filterConfig.multiFilter}
        />
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.virtualcardtransactionhistory"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            sort: {
              sortKey: 'at',
              orderIn: 'desc',
            },
          }}
          data={{
            items: cardTransactions,
            count: _try(() => Object.keys(cardTransactions).length, 0),
          }}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={this.state.columns}
          rowRenderer={this.rowRenderer}
          typeForNoDataText="Transactions"
          paginate
          initialRowsPerPage={25}
          enableExportCSV
          exportName="Transaction History"
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_virtualcardtransactionhistory);

// Internal Helper Functions ...
const _isMissingFrontZero = (lastFour) => `${lastFour[0]}0${lastFour.slice(1)}`;
const filterConfig = {
  multiFilter: {
    cardNumberLastFour: {
      key: 'cardNumberLastFour',
      type: 'string',
      display: 'Card Last 4',
    },
    atAfter: {
      key: 'at',
      type: 'date',
      display: 'Date From',
      condition: 'isAfter',
    },
    atBefore: {
      key: 'at',
      type: 'date',
      display: 'Date To',
      condition: 'isBefore',
    },
    amount: {
      key: 'amount',
      type: 'number',
      display: 'Amount',
    },
    type: {
      key: 'type',
      type: 'option',
      display: 'Type',
      options: {
        authorizations: { display: 'Authorized' },
        declined: { display: 'Declined' },
        cleared: { display: 'Cleared' },
      },
    },
  },
  originalFilter: {
    cardNumberLastFour: {
      key: 'cardNumberLastFour',
      type: 'string',
      display: 'Card',
    },
    at: {
      key: 'at',
      type: 'date',
      display: 'Transaction Date',
    },
    amount: {
      key: 'amount',
      type: 'number',
      display: 'Amount',
    },
    type: {
      key: 'type',
      type: 'option',
      display: 'Type',
      options: {
        authorizations: { display: 'Authorized' },
        declined: { display: 'Declined' },
        cleared: { display: 'Cleared' },
      },
    },
  },
};

const _transactionType = (type) => {
  switch (type) {
    case 'authorizations':
      return 'Authorized';
    case 'declined':
      return 'Declined';
    case 'cleared':
      return 'Cleared';
    default:
      return type;
  }
};

const _paymentIdToRefNumber = (paymentId, paymentStatuses) => paymentStatuses[paymentId] && `P_${paymentStatuses[paymentId]._ref}`;

// GENERATOR_TYPE='component';
