import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    tags: state.global.tags.data.items,
    filteredAndSortedItems: Selectors.tableItems('Components.tables.globalVendorTags', props.tableKey, 'state.global.tags.data.items')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_tables_globalVendorTags extends Component {
  state = {
    columns: [
      { label: 'Name', dataKey: 'name', sortable: true },
      { label: 'Description', dataKey: 'description', sortable: true },
      { label: 'Status', dataKey: 'active', sortable: true, cellRenderer: (data) => { return <Components.badges.status data={data} />; }, exportFormatter: status => (status ? 'Active' : 'Inactive') },
    ],
  };

  componentDidMount() {}
  componentWillUnmount() {}

  rowRenderer = (rowId, rowData, expanded) => {
    return (
      <Components.entities.globalVendorTag
        id={rowId}
      />
    );
  };

  render() {
    const { tags, filteredAndSortedItems } = this.props;

    return (
      <Fragment>
        <Components.tables.components.multiFilter
          tableName="Components.tables.globalVendorTags"
          tableKey={this.props.tableKey || 'default'}
          filterConfig={filterConfig}
        />
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.globalVendorTags"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            sort: {
              sortKey: 'name',
              orderIn: 'asc',
            },
          }}
          data={{
            items: tags,
            count: _try(() => Object.keys(tags).length, 0),
          }}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={this.state.columns}
          rowRenderer={this.rowRenderer}
          typeForNoDataText="Tags"
          paginate
          initialRowsPerPage={25}
          enableExportCSV
          exportName="Global Vendor Tags"
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_globalVendorTags);

// Internal Helper Functions ... 
const filterConfig = {
  name: {
    key: 'name',
    type: 'string',
    display: 'Name',
  },
  description: {
    key: 'description',
    type: 'string',
    display: 'Description',
  },
  active: {
    key: 'active',
    type: 'bool',
    display: 'Status',
    valueDisplay: 'Active',
  },
};

// GENERATOR_TYPE='component';
