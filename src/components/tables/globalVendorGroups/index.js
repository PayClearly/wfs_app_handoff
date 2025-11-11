import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    globalVendorGroups: _try(() => Selectors.tableData.globalVendorGroups(state), {}),
    filteredAndSortedItems: Selectors.tableItems('Components.tables.globalVendorGroups', props.tableKey, 'Selectors.tableData.globalVendorGroups(state)')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_tables_globalVendorGroups extends Component {
  state = {
    columns: [
      { label: 'Name', dataKey: 'name', sortable: true },
      {
        label: 'Accepts',
        dataKey: 'accepts',
        sortable: true,
        cellRenderer: (data, globalVendorGroupId, globalVendorGroup) => {
          const { vCard, ACH, check } = data;
          return (
            <span style={{ fontSize: '28px' }}>
              <Components.badges.psopIcon
                method="vCard"
                accepts={!!vCard}
                groupId={globalVendorGroupId}
                classNames="float-start pe-2"
              />
              <Components.badges.psopIcon
                method="ACH"
                accepts={!!ACH}
                groupId={globalVendorGroupId}
                classNames="float-start pe-2"
              />
              <Components.badges.psopIcon
                method="check"
                accepts={!!check}
                groupId={globalVendorGroupId}
                classNames="float-start pe-2"
              />
            </span>
          );
        },
      },
      { label: 'Vendors', dataKey: 'vendorCount', sortable: true },
      { label: 'Tags', dataKey: 'tagNames', sortable: true },
      { label: 'Active', dataKey: 'active', sortable: true, cellRenderer: (data, globalVendorGroupId, globalVendorGroup) => { return <Components.badges.status data={data} />; }, exportFormatter: active => (active ? 'Active' : 'Inactive') },
    ],
  };




  rowRenderer = (rowId, rowData, expanded) => {
    return (
      <Components.entities.globalVendorGroup id={rowId} data={rowData} />
    );
  };

  render() {
    const { globalVendorGroups, filteredAndSortedItems } = this.props;

    return (
      <Fragment>
        <Components.tables.components.multiFilter
          tableName="Components.tables.globalVendorGroups"
          tableKey={this.props.tableKey || 'default'}
          filterConfig={filterConfig}
        />
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.globalVendorGroups"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            sort: {
              sortKey: 'name',
              orderIn: 'asc',
            },
          }}
          data={{
            items: globalVendorGroups,
            count: _try(() => Object.keys(globalVendorGroups).length, 0),
          }}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={this.state.columns}
          rowRenderer={this.rowRenderer}
          typeForNoDataText="Groups"
          paginate
          initialRowsPerPage={25}
          enableExportCSV
          exportName="Global Vendor Groups"
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_globalVendorGroups);

// Internal Helper Functions ...
const filterConfig = {
  name: {
    key: 'name',
    type: 'string',
    display: 'Name',
  },
  accepts: {
    key: 'accepts',
    type: 'option',
    display: 'Accepts',
    options: {
      vCard: { display: 'Card' },
      ACH: { display: 'ACH' },
      check: { display: 'Check' },
    },
  },
  vendorCount: {
    key: 'vendorCount',
    type: 'number',
    display: 'Vendor Count',
  },
  tagNames: {
    key: 'tagNames',
    type: 'string',
    display: 'Tags',
  },
  active: {
    key: 'active',
    type: 'bool',
    display: 'Active',
  },
};

