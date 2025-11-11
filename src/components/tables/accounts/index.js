import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    canAudit: Selectors.privileges(state).canAudit,
    accounts: _try(() => state.accounts.data.items, {}),
    filteredAndSortedItems: Selectors.tableItems('Components.tables.accounts', props.tableKey, 'state.accounts.data.items')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    changeAccount: (id) => {
      dispatch(Store.account.sync(id));
      dispatch(Store.router.navigateTo('account', { tab: 'account' }));
    },
  });
};

class components_tables_accounts extends Component {

  state = {
    columns: [
      { label: 'Name', dataKey: 'name', sortable: true, default: 'Unknown' },
      { label: 'Status', dataKey: 'active', sortable: true, cellRenderer: data => <Components.badges.status data={data} />, exportFormatter: status => (status ? 'Active' : 'Inactive') },
      { label: 'Suspended', dataKey: 'suspended', sortable: true, cellRenderer: data => <Components.badges.status data={data ? 'suspended' : undefined} color="danger" />, exportFormatter: suspended => (suspended ? 'True' : 'False') },
    ],
  };

  componentDidMount() {}
  componentWillUnmount() {}

  render() {
    const { columns } = this.state;
    const { accounts, filteredAndSortedItems } = this.props;

    if (!this.props.canAudit) return null;
    return (
      <Fragment>
        <Components.tables.components.multiFilter 
          tableName="Components.tables.accounts"
          tableKey={this.props.tableKey || 'default'}
          filterConfig={filterConfig}
        />
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.accounts"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            sort: {
              sortKey: 'name',
              orderIn: 'asc',
              tieBreakKey: '_id',
            },
          }}
          data={{
            items: accounts,
            count: _try(() => Object.keys(accounts).length, 0),
          }}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={columns}
          typeForNoDataText="Accounts"
          onRowClick={rowId => this.props.changeAccount(rowId)}
          iconOverride="mdi-cog"
          paginate
          initialRowsPerPage={10}
          enableExportCSV
          exportCSV="Accounts"
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_accounts);

// Internal Helper Functions ... 
const filterConfig = {
  active: {
    key: 'active',
    type: 'bool',
    display: 'Status',
    valueDisplay: 'Active',
  },
  name: {
    key: 'name',
    type: 'string',
    display: 'Name',
  },
  suspended: {
    key: 'suspended',
    type: 'bool',
    display: 'Suspended',
  },
};

// GENERATOR_TYPE='component';
