import { connect, Component, bindActionCreators, Fragment } from 'component';

import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    credentialSchemas: _resolve(state, 'global.credentialSchemas.data.items', {}),
    filteredAndSortedItems: Selectors.tableItems('Components.tables.globalCredentialSchemas', props.tableKey, 'state.global.credentialSchemas.data.items')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_tables_globalCredentialSchemas extends Component {
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
      <Components.entities.globalCredentialSchema id={rowId} />
    );
  };

  render() {
    const { columns } = this.state;
    const { filteredAndSortedItems, credentialSchemas = {} } = this.props;

    return (
      <Fragment>
        {!this.props.hideFilter &&
          <Components.tables.components.multiFilter
            tableName="Components.tables.globalCredentialSchemas"
            tableKey={this.props.tableKey || 'default'}
            filterConfig={filterConfig.multiFilter}
          />
        }
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.globalCredentialSchemas"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            filters: {},
            sort: {
              sortKey: 'name',
              orderIn: 'asc',
            },
          }}
          data={{
            items: credentialSchemas,
            count: _try(() => Object.keys(credentialSchemas).length, 0),
          }}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={columns}
          rowRenderer={this.rowRenderer}
          typeForNoDataText="Credential Schemas"
          paginate
          initialRowsPerPage={25}
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_tables_globalCredentialSchemas);

// Internal Helper Functions ... 
const filterConfig = {
  multiFilter: {
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
  },
  originalFilter: {},
};

