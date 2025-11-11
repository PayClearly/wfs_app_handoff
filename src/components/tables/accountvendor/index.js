import {
  connect, Component, Fragment,
} from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  // tags
  const isAllTagsLoaded = _try(() => Selectors.globalTaggedItems(state).allTagsLoaded, false);

  // account
  const isAchAccountDetailsFetched = state.account.achAccountDetails.status.fetched;
  const isAccountVendorsFetched = state.account.accountVendors.status.fetched;
  const isAccountReady = isAchAccountDetailsFetched && isAccountVendorsFetched;

  // integrations
  const { cardsIntegration, achIntegration, checksIntegration } = Selectors.integrations(state);
  const isCardsIntegrationFetched = cardsIntegration.status.fetched;
  const isAchIntegrationFetched = achIntegration.status.fetched;
  const isChecksIntegrationFetched = checksIntegration.status.fetched;
  const isIntegrationFetched = isCardsIntegrationFetched || isAchIntegrationFetched || isChecksIntegrationFetched;

  // data to return
  const loaded = isAllTagsLoaded && isAccountReady && isIntegrationFetched;
  const accountVendors = Selectors.accountVendors(state).all;
  const filteredAndSortedItems = Selectors.tableItems(
    'Components.tables.accountvendor',
    props.tableKey,
    'Selectors.accountVendors(state).all'
  )(state);
  const policies = Selectors.entity('accountVendors_idOrganization_idAccount')(state);

  return {
    loaded,
    accountVendors,
    filteredAndSortedItems,
    policies,
  };
};

const mapDispatchToProps = () => ({});

const rowRenderer = (rowId) => (
  <Components.entities.accountvendor id={rowId} />
);

class components_tables_accountvendor extends Component {
  state = {
    columns: [
      {
        label: 'Name',
        dataKey: 'display',
        sortable: true,
      },
      {
        label: 'Vendor',
        dataKey: 'name',
        disableRender: true,
      },
      {
        label: 'Accepts',
        dataKey: 'accepts',
        sortable: true,
        cellRenderer: (data) => <Components.badges.acceptsmethod data={data} />,
      },
      {
        label: 'Linked',
        dataKey: 'linkedWithPayClearly',
        sortable: true,
        cellRenderer: (data) => <Components.badges.checkmark data={data} />,
        exportFormatter: (linked) => (linked ? 'True' : 'False'),
      },
      {
        label: 'ERP Linked',
        dataKey: 'linkedWithERP',
        sortable: true,
        tieBreakKey: 'display',
        cellRenderer: (data) => <Components.badges.checkmark data={data} />,
        exportFormatter: (erpLinked) => (erpLinked ? 'True' : 'False'),
      },
      {
        label: 'Date Added',
        dataKey: 'createdAt',
        sortable: true,
        sortKey: 'timestampAdded',
        tieBreakKey: 'display',
      },
      {
        label: 'Date Last Modified',
        dataKey: 'lastModifiedAt',
        sortable: true,
        sortKey: 'timestampModified',
        tieBreakKey: 'display',
      },
      {
        label: 'Status',
        dataKey: 'active',
        sortable: true,
        cellRenderer: (data) => <Components.badges.status data={data} />,
        exportFormatter: (status) => (status ? 'Active' : 'Inactive'),
      },
      {
        label: '',
        dataKey: 'needsAttention',
        sortable: true,
        cellRenderer: (data) => <Components.badges.needsattention data={data} />,
      },
      {
        label: 'Check Address Line 1',
        dataKey: 'checkAddressLine1',
        disableRender: true,
      },
      {
        label: 'Check Address Line 2',
        dataKey: 'checkAddressLine2',
        disableRender: true,
      },
      {
        label: 'Check City',
        dataKey: 'checkCity',
        disableRender: true,
      },
      {
        label: 'Check State',
        dataKey: 'checkStateProv',
        disableRender: true,
      },
      {
        label: 'Check Postal Code',
        dataKey: 'checkPostalCode',
        disableRender: true,
      },
      {
        label: 'Linked With PC Name',
        dataKey: 'linkedWithPayClearlyName',
        disableRender: true,
      },
    ],
  };

  componentDidMount() {
    if (this.props.vendors) {
      // make columns not sortable if upload table
      this.setState((prevState) => ({
        columns: prevState.columns.map((column) => ({ ...column, sortable: false })),
      }));
    }
  }

  render() {
    const {
      accountVendors = {},
      filteredAndSortedItems = [],
      loaded,
      tableOnly,
      sortBy = 'display',
      vendors = null,
    } = this.props;
    const { columns } = this.state;

    const dataForTable = {
      items: accountVendors,
      count: _try(() => Object.keys(accountVendors).length, 0),
    };
    let itemOrder = _try(() => filteredAndSortedItems, []);
    if (vendors) {
      const vendorIds = Object.keys(vendors);
      dataForTable.items = vendors;
      dataForTable.count = vendorIds.length;
      itemOrder = vendorIds.sort((vendor1, vendor2) => {
        if (vendor1[sortBy] < vendor2[sortBy]) {
          return -1;
        }
        if (vendor1[sortBy] > vendor2[sortBy]) {
          return 1;
        }
        return 0;
      });
    }

    if (!loaded) {
      return <Components.spinner />;
    }

    return (
      <Fragment>
        {
          !tableOnly
          && <Components.tables.components.multiFilter
            tableName="Components.tables.accountvendor"
            tableKey={this.props.tableKey || 'default'}
            filterConfig={filterConfig.multiFilter}
          />
        }
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.accountvendor"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            filters: {
              active: {
                key: 'active',
                type: 'bool',
                comparator: 'is',
                value: true,
              },
            },
            sort: {
              sortKey: sortBy,
              orderIn: 'asc',
              tieBreakKey: 'linkedWithPayClearly',
            },
          }}
          data={dataForTable}
          itemOrder={itemOrder}
          columns={columns}
          rowRenderer={rowRenderer}
          typeForNoDataText="Vendors"
          paginate
          initialRowsPerPage={10}
          enableExportCSV
          exportName="Account Vendors"
        />
      </Fragment>
    );
  }

}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_accountvendor);

// Internal Helper Functions ... 
const filterConfig = {
  multiFilter: {
    display: {
      key: 'display',
      type: 'string',
      display: 'Name',
    },
    accepts: {
      key: 'accepts',
      type: 'option',
      display: 'Method',
      options: {
        vCard: { display: 'Card' },
        ACH: { display: 'ACH' },
        check: { display: 'Check' },
      },
    },
    linkedWithPayClearly: {
      key: 'linkedWithPayClearly',
      type: 'bool',
      display: 'Linked to PC',
    },
    linkedWithERP: {
      key: 'linkedWithERP',
      type: 'bool',
      display: 'Linked to ERP',
    },
    active: {
      key: 'active',
      type: 'bool',
      display: 'Status',
      valueDisplay: 'Active',
    },
  },
  originalFilter: {
    display: {
      key: 'display',
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
    linkedWithPayClearly: {
      key: 'linkedWithPayClearly',
      type: 'bool',
      display: 'Linked',
    },
    linkedWithERP: {
      key: 'linkedWithERP',
      type: 'bool',
      display: 'ERP Linked',
    },
    active: {
      key: 'active',
      type: 'bool',
      display: 'Status',
      valueDisplay: 'Active',
    },
    needsAttention: {
      key: 'needsAttention',
      type: 'bool',
      display: 'Has Issues',
    },
  },
};

// GENERATOR_TYPE='component';
