import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    loaded: _try(() => state.account.accountVendors.status.fetched && state.account.accountVendorEnrollments.status.fetched, false),
    accountVendorEnrollments: Selectors.tableData.accountVendorEnrollments(state),
    filteredAndSortedItems: Selectors.tableItems('Components.tables.accountVendorEnrollments', props.tableKey || 'default', 'Selectors.tableData.accountVendorEnrollments(state)')(state),
    policies: Selectors.entity('accountVendorEnrollments_idOrganization_idAccount')(state),
    usersAssignedTo: Selectors.usersAssignedToAccountVendorEnrollments(state),
    users: state.users.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

const rowRenderer = (rowId, rowData, expanded) => {
  return (
    <Components.entities.accountVendorEnrollment id={rowId} />
  );
};

class components_tables_accountVendorEnrollments extends Component {
  state = {
    columns: [
      { label: 'Vendor', dataKey: 'vendorDisplay', sortable: true },
      { label: 'Status', dataKey: 'status', sortable: true, cellRenderer: data => <Components.badges.accountVendorEnrollmentStatus status={data} /> },
      { label: 'Accepts', dataKey: 'accepts', sortable: true, cellRenderer: data => <Components.badges.acceptsmethod data={data} /> },
      { label: 'Assigned To', dataKey: 'assignedTo', sortable: true, cellRenderer: data => (data ? <Components.badges.createdby user={data} /> : '-'), disableExport: true },
      { label: 'Spend Projection', dataKey: 'spendProjection', sortable: true, cellRenderer: data => (data ? Utils.numeral()(data).format('$0,0.00') : '-'), exportFormatter: spendProjection => (spendProjection ? Utils.numeral()(spendProjection).format('$0,0.00') : '-') },
    ],
  }

  componentDidMount() {}
  componentWillUnmount() {}

  render() {
    const {
      accountVendorEnrollments = {},
      filteredAndSortedItems = [],
      loaded,
      tableOnly,
      usersAssignedTo,
      users = {},
    } = this.props;
    const { columns } = this.state;

    if (!loaded) return <Components.spinner />;

    return (
      <Fragment>
        {
          !tableOnly &&
          <Fragment>
            <Components.tables.components.multiFilter
              tableName="Components.tables.accountVendorEnrollments"
              tableKey={this.props.tableKey || 'default'}
              filterConfig={_getFilterConfig(usersAssignedTo, users, true)}
            />
          </Fragment>
        }
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.accountVendorEnrollments"
          tableKey={this.props.tableKey || 'default'}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            filters: {},
            sort: {
              sortKey: 'vendorDisplay',
              orderIn: 'asc',
            },
          }}
          data={{
            items: accountVendorEnrollments,
            count: Object.keys(accountVendorEnrollments).count,
          }}
          itemOrder={filteredAndSortedItems}
          columns={columns}
          rowRenderer={rowRenderer}
          typeForNoDataText="Vendor Enrollments"
          paginate
          initialRowsPerPage={25}
          enableExport
          exportFilePrefix="vendor_enrollments"
          enableExportCSV
          exportName="Account Vendor Enrollments"
        />
      </Fragment>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_tables_accountVendorEnrollments);

// Internal Helper Functions ... 
const _getFilterConfig = (usersAssignedTo, users, multiFilter) => {
  let showAssignedTo = false;
  const options = Object.keys(usersAssignedTo || {}).reduce((acc, userId) => {
    if (!showAssignedTo) showAssignedTo = true;
    const user = users[userId];
    acc[userId] = { display: user.label };
    return acc;
  }, {});
  
  let assignedToFilter = {};
  if (showAssignedTo) {
    assignedToFilter = {
      assignedTo: {
        key: 'assignedTo',
        type: 'option',
        display: 'Assigned To',
        options,
      },
    };
  }

  const filterConfigToCopy = multiFilter ? filterConfig.multiFilter : filterConfig.originalFilter;

  return { ...filterConfigToCopy, ...assignedToFilter };
};

const filterConfig = {
  multiFilter: {
    vendorDisplay: {
      key: 'vendorDisplay',
      type: 'string',
      display: 'Vendor',
    },
    status: {
      key: 'status',
      type: 'option',
      display: 'Status',
      options: {
        pending: { display: 'Pending' },
        inProgress: { display: 'In Progress' },
        attention: { display: 'Attention' },
        enrolled: { display: 'Enrolled' },
        declined: { display: 'Declined' },
      },
    },
    spendProjection: {
      key: 'spendProjection',
      type: 'number',
      display: 'Spend Projection',
    },
  },
  originalFilter: {},
};

// GENERATOR_TYPE='component';
