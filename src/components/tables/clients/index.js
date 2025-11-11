import { connect, Component, bindActionCreators, Fragment } from 'component';

import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    clients: state.account.clients.data.items,
    filteredAndSortedItems: Selectors.tableItems('Components.tables.clients', props.tableKey, 'state.account.clients.data.items')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_tables_clients extends Component {
  state = {
    columns: [
      { label: 'Name', dataKey: 'display', sortable: true },
    ],
  };

  componentDidMount() {}
  componentWillUnmount() {}

  rowRenderer = (rowId) => {
    return <Components.entities.client id={rowId} />;
  }

  render() {
    const { columns } = this.state;
    const { filteredAndSortedItems, clients = {} } = this.props;
    return (
      <Fragment>
        {!this.props.hideFilter &&
          <Components.tables.components.multiFilter
            tableName="Components.tables.clients"
            tableKey={this.props.tableKey || 'default'}
            filterConfig={filterConfig.multiFilter}
          />
        }
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.clients"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            filters: {},
            sort: {
              sortKey: 'display',
              orderIn: 'asc',
            },
          }}
          data={{
            items: clients,
            count: _try(() => Object.keys(clients).length, 0),
          }}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={columns}
          rowRenderer={this.rowRenderer}
          typeForNoDataText="Clients"
          paginate
          initialRowsPerPage={25}
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_tables_clients);

// Internal Helper Functions ... 
const filterConfig = {
  multiFilter: {
    display: {
      key: 'display',
      type: 'string',
      display: 'Name',
    },
  },
  originalFilter: {},
};

