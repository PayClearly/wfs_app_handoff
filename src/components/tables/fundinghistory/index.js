import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    canRead: Selectors.entity('fundingIntegration_idOrganization_idAccount')(state).canRead,
    transfersStatus: _try(() => state.account.achTransfers.status, {}),
    transfers: _try(() => Selectors.fundingTableData(state), {}),
    filteredAndSortedItems: Selectors.tableItems('Components.tables.fundinghistory', props.tableKey, 'Selectors.fundingTableData(state)')(state),
    routeParams: state.router.route.params,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_tables_fundinghistory extends Component {
  state = {
    columns: [
      { label: 'Type', dataKey: 'transferType', sortable: true, cellRenderer: (data, transferId, transfer) => { return <Components.badges.fundingAction inbound={data === 'deposit'} />; } },
      { label: 'Status', dataKey: 'status', sortable: true, cellRenderer: (data) => { return <Components.badges.fundingtransferstatus status={data} />; }, exportFormatter: status => status.charAt(0).toUpperCase() + status.slice(1) },
      { label: 'Date', dataKey: '_createdAt', sortable: true, default: 'Unknown', cellRenderer: (_createdAt) => { return _createdAt ? Utils.dates.dateToDay(_createdAt) : null; }, exportFormatter: Utils.dates.dateToDay },
      { label: 'Amount', dataKey: 'amount', sortable: true, default: 'Unknown', cellRenderer: formatMoneyAmount, exportFormatter: formatMoneyAmount },
      { label: 'Note', dataKey: 'note', sortable: false, default: '-' },
    ],
  };

  componentDidMount() {}
  componentWillUnmount() {}

  rowRenderer = (rowId, rowData, expanded) => {
    return <Components.overviews.fundingtransfers transferItem={rowData} />;
  };

  render() {
    const { columns } = this.state;
    const { transfers, transfersStatus, canRead, filteredAndSortedItems } = this.props;
    
    if (!transfersStatus.fetched) return null;
    if (!canRead) return <Components.invalidpermissions />;

    const selectedTransferId = _try(() => this.props.routeParams.transferId);

    return (
      <Fragment>
        <Components.tables.components.multiFilter
          tableName="Components.tables.fundinghistory"
          tableKey={this.props.tableKey || 'default'}
          filterConfig={filterConfig.multiFilter}
        />
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.fundinghistory"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            sort: {
              sortKey: '_createdAt',
              orderIn: 'desc',
              tieBreakKey: 'id',
            },
          }}
          data={{
            items: transfers,
            count: _try(() => Object.keys(transfers).length, 0),
          }}
          defaultSelectedRowId={selectedTransferId || null}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={columns}
          rowRenderer={this.rowRenderer}
          typeForNoDataText="Funding Transfers"
          paginate
          initialRowsPerPage={25}
          enableExportCSV
          exportName="Funding History"
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_fundinghistory);

// Internal Helper Functions ... 
const filterConfig = {
  multiFilter: {
    amount: {
      key: 'amount',
      type: 'number',
      display: 'Amount',
    },
    _createdAtAfter: {
      key: '_createdAt',
      type: 'date',
      display: 'Date From',
      condition: 'isAfter',
    },
    _createdAtBefore: {
      key: '_createdAt',
      type: 'date',
      display: 'Date To',
      condition: 'isBefore',
    },
    status: {
      key: 'status',
      type: 'option',
      display: 'Status',
      options: {
        pending: { display: 'Pending' },
        processed: { display: 'Processed' },
        complete: { display: 'Complete' },
        cancelled: { display: 'Cancelled' },
      },
    },
    transferType: {
      key: 'transferType',
      type: 'option',
      display: 'Transfer Type',
      options: {
        deposit: { display: 'Deposit' },
        withdrawal: { display: 'Withdrawal' },
      },
    },
    note: {
      key: 'note',
      type: 'string',
      display: 'Note',
    },
  },
  originalFilter: {
    active: {
      key: 'active',
      type: 'bool',
      display: 'Active',
    },
    transferType: {
      key: 'transferType',
      type: 'option',
      display: 'Transfer Type',
      options: {
        deposit: { display: 'Deposit' },
        withdrawal: { display: 'Withdrawal' },
      },
    },
    status: {
      key: 'status',
      type: 'option',
      display: 'Status',
      options: {
        pending: { display: 'Pending' },
        processed: { display: 'Processed' },
        complete: { display: 'Complete' },
        cancelled: { display: 'Cancelled' },
      },
    },
    _createdAt: {
      key: '_createdAt',
      type: 'date',
      display: 'Date',
    },
    amount: {
      key: 'amount',
      type: 'number',
      display: 'Amount',
    },
    note: {
      key: 'note',
      type: 'string',
      display: 'Note',
    },
  },
};

const formatMoneyAmount = (amount) => {
  return Utils.numeral()(amount).format('$0,0.00');
};

