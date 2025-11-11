import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    expenses: state.account.expenses.data.items,
    filteredAndSortedItems: Selectors.tableItems('Components.tables.expenses', props.tableKey, 'state.account.expenses.data.items')(state),
    userId: _try(() => state.user.profile.data.item._id, ''),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_tables_expenses extends Component {
  state = {
    columns: [
      { label: 'Date', dataKey: 'date', sortable: true, cellRenderer: date => Utils.dates.dateToDay(date, 'dateFormatUS'), exportFormatter: date => Utils.dates.dateToDay(date, 'dateFormatUS') },
      { label: 'Vendor', dataKey: 'vendor', sortable: true, default: 'Unknown' },
      { label: 'Amount', dataKey: 'amount', sortable: true, default: 'Unknown', cellRenderer: amount => Utils.numeral()(amount).format('$0,0.00'), exportFormatter: amount => Utils.numeral()(amount).format('$0,0.00') },
      { label: 'Source', dataKey: 'source', sortable: true, default: 'Unknown', cellRenderer: source => <Components.badges.expenseSource source={source} />, exportFormatter: source => (source === 'manual' ? 'Manual' : 'Card') },
      { label: 'Receipt', dataKey: 'receipt', sortable: false, cellRenderer: receipt => <Components.badges.expenseReceipt receipt={receipt} />, exportFormatter: hasReceipt => (hasReceipt ? 'True' : 'False') },
      { label: 'Report', dataKey: 'reportId', sortable: false, cellRenderer: reportId => (reportId ? <Components.chip refId={reportId} /> : <span />) },
      { label: 'Memo', dataKey: 'memo', sortable: true, default: '' },
    ],
  };

  componentDidMount() {}
  componentWillUnmount() {}

  rowRenderer = (rowId) => {
    return <Components.entities.expense id={rowId} />;
  }

  render() {
    const { columns } = this.state;
    const { filteredAndSortedItems, expenses = {} } = this.props;
    return (
      <Fragment>
        {!this.props.hideFilter &&
          <Components.tables.components.multiFilter
            tableName="Components.tables.expenses"
            tableKey={this.props.tableKey || 'default'}
            filterConfig={filterConfig.multiFilter}
          />
        }
        <Components.tables.components.collapsibleTable
          {...this.props}
          tableName="Components.tables.expenses"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            filters: {
              deleted: { key: 'deleted', type: 'bool', comparator: 'is', value: false },
              createdBy: { key: 'createdBy', type: 'string', comparator: 'equals', value: this.props.userId },
            },
            sort: {
              sortKey: 'date',
              orderIn: 'desc',
            },
          }}
          data={{
            items: expenses,
            count: _try(() => Object.keys(expenses).length, 0),
          }}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={columns}
          rowRenderer={this.rowRenderer}
          typeForNoDataText="Expenses"
          doNotExpand={this.props.doNotExpand}
          nestedTable={this.props.nestedTable}
          paginate
          initialRowsPerPage={this.props.nestedTable ? 10 : 25}
          hideRowsPerPageSelector={this.props.nestedTable}
          enableExportCSV={this.props.enableExportCSV || false}
          exportName="Expenses"
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_tables_expenses);

// Internal Helper Functions ... 
const filterConfig = {
  multiFilter: {
    dateAfter: {
      key: 'date',
      type: 'date',
      display: 'Date From',
      condition: 'isAfter',
    },
    dateBefore: {
      key: 'date',
      type: 'date',
      display: 'Date To',
      condition: 'isBefore',
    },
    vendor: {
      key: 'vendor',
      type: 'string',
      display: 'Vendor',
    },
    amount: {
      key: 'amount',
      type: 'number',
      display: 'Amount',
    },
    memo: {
      key: 'memo',
      type: 'string',
      display: 'Memo',
    },
  },
  originalFilter: {},
};

