import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    schemas: state.global.schemas.data.items,
    filteredAndSortedItems: Selectors.tableItems('Components.tables.globalVendorSchemas', props.tableKey, 'state.global.schemas.data.items')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_tables_globalVendorSchemas extends Component {
  state = {
    columns: [
      { label: 'Schema Name', dataKey: 'name', sortable: true },
      { label: 'Active', dataKey: 'active', sortable: true, cellRenderer: (data) => { return <Components.badges.status data={data} />; } },
    ],
  };

  componentDidMount() {}
  componentWillUnmount() {}

  rowRenderer = (rowId, rowData, expanded) => {
    return (
      <Components.entities.globalVendorSchema id={rowId} />
    );
  };

  render() {
    const { schemas, filteredAndSortedItems } = this.props;
    return (
      <Fragment>
        <Components.tables.components.multiFilter
          tableName="Components.tables.globalVendorSchemas"
          tableKey={this.props.tableKey || 'default'}
          filterConfig={filterConfig}
        />
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.globalVendorSchemas"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride &&
            {
              filters: {
                ...(this.props.initialTableStateOverride.filters || {}),
              },
              sort: {
                ...(this.props.initialTableStateOverride.sort || {}),
              },
            }
          }
          defaultTableState={{
            filters: {},
            sort: {
              sortKey: 'name',
              orderIn: 'asc',
            },
          }}
          data={{
            items: schemas,
            count: _try(() => Object.keys(schemas).length, 0),
          }}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={this.state.columns}
          rowRenderer={this.rowRenderer}
          typeForNoDataText="Payment Schemas"
          paginate
          initialRowsPerPage={25}
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_globalVendorSchemas);

// Internal Helper Functions ... 
const filterConfig = {
  name: {
    key: 'name',
    type: 'string',
    display: 'Schema Name',
  },
  active: {
    key: 'active',
    type: 'bool',
    display: 'Active',
  },
};

// GENERATOR_TYPE='component';
