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
    organizations: _try(() => state.organizations.data.items, {}),
    filteredAndSortedItems: Selectors.tableItems('Components.tables.organizations', props.tableKey, 'state.organizations.data.items')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    changeOrganization: (id) => {
      dispatch(Store.organization.sync(id));
      dispatch(Store.router.navigateTo('organization', { tab: 'organization' }));
    },
  });
};

class components_tables_organizations extends Component {

  state = {
    columns: [
      { label: 'Name', dataKey: 'name', sortable: true, default: 'Unknown' },
      { label: 'Status', dataKey: 'active', sortable: true, cellRenderer: data => (<Components.badges.status data={data} />), exportFormatter: active => (active ? 'Active' : 'Inactive') },
    ],
  }

  componentDidMount() {}
  componentWillUnmount() {}

  // getRowData = (organization) => {
  //   return {
  //     name: organization.name,
  //     active: organization.active,
  //     id: organization._id,
  //   };
  // }

  render() {
    if (!this.props.canAudit) return null;
    const { columns } = this.state;
    const { organizations, filteredAndSortedItems } = this.props;

    return (
      <Fragment>
        <Components.tables.components.multiFilter 
          tableName="Components.tables.organizations"
          tableKey={this.props.tableKey || 'default'}
          filterConfig={filterConfig}
        />
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.organizations"
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
            items: organizations,
            count: _try(() => Object.keys(organizations).length, 0),
          }}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={columns}
          typeForNoDataText="Organizations"
          onRowClick={rowId => this.props.changeOrganization(rowId)}
          iconOverride="mdi-cog"
          paginate
          initialRowsPerPage={10}
          enableExportCSV
          exportName="Organizations"
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_organizations);

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
};

// GENERATOR_TYPE='component';
