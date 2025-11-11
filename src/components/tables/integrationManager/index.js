import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    resourceProperties: _try(() => Selectors.integrations(state)[props.integrationName].possibleResources[props.resourceName].properties, {}),
    resources: _try(() => Selectors.integrations(state)[props.integrationName].data.resources[props.resourceName], {}),
    filteredAndSortedItems: Selectors.tableItems('Components.tables.integrationManager', props.tableKey, `Selectors.integrations(state).${props.integrationName}.data.resources.${props.resourceName}`)(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_tables_integrationManager extends Component {
  state = {
    columns: [],
  };

  componentDidMount() {
    const columns = Object.keys(this.props.resourceProperties).map((property) => {
      return { label: property, dataKey: property, sortable: true };
    });
    this.setState({ columns });
  }
  componentWillUnmount() { }

  rowRenderer = (rowId, rowData, expanded) => {
    return (
      <Components.entities.integrationManager
        integrationName={this.props.integrationName}
        resourceName={this.props.resourceName}
        id={rowId}
        forError={this.props.forError}
      />
    );
  };

  render() {
    const { resources, filteredAndSortedItems } = this.props;

    return (
      <Fragment>
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.integrationManager"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            sort: {
              sortKey: _try(() => this.state.columns[0].dataKey, ''),
              orderIn: 'asc',
            },
          }}
          data={{
            items: resources,
            count: _try(() => Object.keys(resources).length, 0),
          }}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={this.state.columns}
          rowRenderer={this.rowRenderer}
          typeForNoDataText="Resources"
          paginate
          initialRowsPerPage={10}
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_integrationManager);


