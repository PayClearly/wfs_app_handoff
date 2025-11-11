import {
 connect, Component, bindActionCreators, Fragment, 
} from 'component';

import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
    clientVendorLinksTableData: Selectors.tableData.clientVendorLinks(state),
    standardCredentialFields: state.global.standardCredentialFields.data.items || {},
    filteredAndSortedItems: Selectors.tableItems('Components.tables.clientVendorLinks', props.tableKey, 'Selectors.tableData.clientVendorLinks(state).items')(state),
  });

const mapDispatchToProps = (dispatch, props) => ({});

const mapResourcesToProps = (state, props) => ({});

class components_tables_clientVendorLinks extends Component {
  componentDidMount() {}

  componentWillUnmount() {}

  rowRenderer = (rowId, rowData) => <Components.entities.clientVendorLink id={rowId} clientId={rowData.clientId} vendorId={rowData.vendorId} />;

  columns = () => {
    const columns = [
      { 
        label: 'Client', 
        dataKey: 'clientDisplay', 
        sortable: true,
      },
      { 
        label: 'Vendor', 
        dataKey: 'vendorDisplay', 
        sortable: true,
      },
      {
        label: 'Credentials', 
        dataKey: 'credentialsDisplay', 
        sortable: true, 
        cellRenderer: (value) => <Components.badges.clientVendorLinkCredentialsDisplay data={value} />, 
        exportFormatter: (credentials) => (credentials === 'none' ? 'False' : 'True'), 
      },
    ];
    const hiddenCredentialFieldColumns = Object.values(this.props.standardCredentialFields)
      .map(({ key, name }) => ({
          label: name,
          dataKey: 'credentials',
          disableRender: true,
          exportFormatter: ((credentials = {}) => credentials[key]),
        }));

    return [...columns, ...hiddenCredentialFieldColumns];
  };

  render() {
    const { filteredAndSortedItems, clientVendorLinksTableData = {} } = this.props;
    return (
      <Fragment>
        {!this.props.hideFilter
          && <Components.tables.components.multiFilter
            tableName="Components.tables.clientVendorLinks"
            tableKey={this.props.tableKey || 'default'}
            filterConfig={filterConfig.multiFilter}
          />}
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.clientVendorLinks"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            filters: {},
            sort: {
              sortKey: 'display',
              orderIn: 'asc',
            },
          }}
          data={clientVendorLinksTableData}
          itemOrder={_try(() => filteredAndSortedItems, [])}
          columns={this.columns()}
          rowRenderer={this.rowRenderer}
          typeForNoDataText="Client-Vendor Links"
          paginate
          initialRowsPerPage={25}
          enableExportCSV
          exportName="Client Vendor Links"
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_tables_clientVendorLinks);

// Internal Helper Functions ... 
const filterConfig = {
  multiFilter: {
    clientDisplay: {
      key: 'clientDisplay',
      type: 'string',
      display: 'Client',
    },
    vendorDisplay: {
      key: 'vendorDisplay',
      type: 'string',
      display: 'Vendor',
    },
    credentialsDisplay: {
      key: 'credentialsDisplay',
      type: 'option',
      display: 'Credentials',
      options: {
        none: { display: 'N/A' },
        valid: { display: 'Valid' },
        invalid: { display: 'Invalid' },
      },
    },
  },
  originalFilter: {},
};

