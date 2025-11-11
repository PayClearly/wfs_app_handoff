import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    globalVendors: _try(() => Selectors.tableData.globalVendors(state), {}),
    filteredAndSortedItems: Selectors.tableItems('Components.tables.globalVendors', props.tableKey, 'Selectors.tableData.globalVendors(state)')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_tables_globalVendors extends Component {
  state = {
    columns: [
      { label: 'Name', dataKey: 'name', sortable: true },
      { label: 'Groups', dataKey: 'groupNames', sortable: true },
      { label: 'Tags', dataKey: 'groupTags', sortable: true },
      { label: 'Status', dataKey: 'active', sortable: true, cellRenderer: (data, globalVendorId, globalVendor) => { return <Components.badges.status data={data} />; }, exportFormatter: status => (status ? 'Active' : 'Inactive') },
    ],
  };

  componentDidMount() {}
  componentWillUnmount() {}

  rowRenderer = (rowId, rowData, expanded) => {
    return (
      <Components.entities.globalVendor
        globalVendorId={rowId}
      />
    );
  };

  render() {
    const { globalVendors, filteredAndSortedItems } = this.props;

    return (
      <Fragment>
        <Components.tables.components.multiFilter
          tableName="Components.tables.globalVendors"
          tableKey={this.props.tableKey || 'default'}
          filterConfig={filterConfig}
        />
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.globalVendors"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            sort: {
              sortKey: 'name',
              orderIn: 'asc',
            },
          }}
          data={{
            items: globalVendors,
            count: _try(() => Object.keys(globalVendors).length, 0),
          }}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={this.state.columns}
          rowRenderer={this.rowRenderer}
          typeForNoDataText="Global Vendors"
          paginate
          initialRowsPerPage={25}
          enableExportCSV
          exportName="Global Vendors"
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_globalVendors);

// Internal Helper Functions ... 
const filterConfig = {
  name: {
    key: 'name',
    type: 'string',
    display: 'Name',
  },
  groupNames: {
    key: 'groupNames',
    type: 'string',
    display: 'Groups',
  },
  groupTags: {
    key: 'groupTags',
    type: 'string',
    display: 'Tags',
  },
  active: {
    key: 'active',
    type: 'bool',
    display: 'Status',
    valueDisplay: 'Active',
  },
};

