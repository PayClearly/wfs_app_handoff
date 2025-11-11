import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    expenseReportsData: Selectors.tableData.expenseReports(state),
    filteredAndSortedItems: Selectors.tableItems('Components.tables.expenseReports', props.tableKey, 'Selectors.tableData.expenseReports(state).items')(state),
    userId: _try(() => state.user.profile.data.item._id, ''),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_tables_expenseReports extends Component {
  state = {
    columns: [
      { label: 'Name', dataKey: 'name', sortable: true },
      { label: 'From', dataKey: 'createdBy', sortable: true, cellRenderer: createdBy => <Components.badges.createdby user={createdBy} /> },
      { label: 'To', dataKey: 'approver', sortable: true, cellRenderer: approver => <Components.badges.createdby user={approver} default="Any Approver" /> },
      { label: 'Total', dataKey: 'recordTotal', sortable: true, cellRenderer: total => Utils.numeral()(total).format('$0,0.00'), exportFormatter: total => Utils.numeral()(total).format('$0,0.00') },
      { label: 'Records', dataKey: 'recordCount', sortable: true },
      { label: 'Report Status', dataKey: 'status', sortable: true, cellRenderer: status => <Components.badges.expenseReportStatus status={status} />, exportFormatter: status => (status.length > 0 ? status[0].toUpperCase() + status.slice(1) : null) },
      { label: 'Submit Date', dataKey: '_createdAt', sortable: true, cellRenderer: date => Utils.dates.dateToDay(date, 'dateFormatUS'), exportFormatter: date => Utils.dates.dateToDay(date, 'dateFormatUS') },
      { label: 'Ref #', dataKey: '_ref', sortable: true, cellRenderer: (data, rowId, expenseReport) => { return expenseReport._ref ? `E_${expenseReport._ref}` : ''; }, exportFormatter: ref => (ref ? `E_${ref}` : null) },
    ],
  };

  componentDidMount() {}
  componentWillUnmount() {}

  rowRenderer = (rowId) => {
    return <Components.entities.expenseReport id={rowId} />;
  }

  render() {
    const { columns } = this.state;
    const { filteredAndSortedItems, expenseReportsData = {} } = this.props;
    return (
      <Fragment>
        <Components.tables.components.multiFilter
          tableName="Components.tables.expenseReports"
          tableKey={this.props.tableKey || 'default'}
          filterConfig={this.props.filterConfigKeys ? this.props.filterConfigKeys.reduce((acc, key) => { acc[key] = filterConfig.multiFilter[key]; return acc; }, {}) : filterConfig.multiFilter}
        />
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.expenseReports"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            filters: {
              deleted: { key: 'deleted', type: 'bool', comparator: 'is', value: false },
              createdBy: { key: 'createdBy', type: 'string', comparator: 'equals', value: this.props.userId },
            },
            sort: {
              sortKey: '_ref',
              orderIn: 'desc',
            },
          }}
          data={{
            items: expenseReportsData.items,
            count: _try(() => expenseReportsData.count, 0),
          }}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={columns}
          rowRenderer={this.rowRenderer}
          typeForNoDataText={this.props.typeForNoDataTextOverride || 'Expense Reports'}
          defaultSelectedRowId={this.props.defaultSelectedRowId || null}
          paginate
          initialRowsPerPage={25}
          enableExportCSV
          exportName="Expense Reports"
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_tables_expenseReports);

// Internal Helper Functions ... 
const filterConfig = {
  multiFilter: {
    name: {
      key: 'name',
      type: 'string',
      display: 'Name',
    },
    status: {
      key: 'status',
      type: 'option',
      display: 'Status',
      options: {
        open: { display: 'Open' },
        submitted: { display: 'Submitted' },
        rejected: { display: 'Rejected' },
        approved: { display: 'Approved' },
        reimbursed: { display: 'Reimbursed' },
      },
    },
    dateAfter: {
      key: '_createdAt',
      type: 'date',
      display: 'Date From',
      condition: 'isAfter',
    },
    dateBefore: {
      key: '_createdAt',
      type: 'date',
      display: 'Date To',
      condition: 'isBefore',
    },
    recordTotal: {
      key: 'recordTotal',
      type: 'number',
      display: 'Total',
    },
    recordCount: {
      key: 'recordCount',
      type: 'number',
      display: 'Records',
    },
  },
  originalFilter: {},
};

