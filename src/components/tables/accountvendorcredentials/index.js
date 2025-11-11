import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    accountVendorCredentials: Selectors.tableData.accountvendorcredentials(state),
    filteredAndSortedItems: Selectors.tableItems('Components.tables.accountvendorcredentials', props.tableKey, 'Selectors.tableData.accountvendorcredentials(state)')(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const rowRenderer = (rowId, rowData, expanded) => {
  return (
    <Components.entities.accountvendorcredentials id={rowId} />
  );
};

const ValidCreds = (data) => {
  return (
    <span>
      {data && <i className="mdi mdi-check text-success" /> || <i className="mdi mdi-alert-circle-outline text-danger" />}
    </span>
  );
};

class components_tables_accountvendorcredentials extends Component {

  state = {
    columns: [
      { label: 'Name', dataKey: 'name', sortable: true },
      { label: 'Valid', dataKey: 'hasValidCreds', sortable: true, cellRenderer: ValidCreds },
    ],
  };

  componentDidMount() { }
  componentWillUnmount() { }

  render() {
    const { accountVendorCredentials, filteredAndSortedItems } = this.props;
    // Right now we only care about vender schemas associated with vCards

    return (
      <Components.tables.components.collapsibleTable
        tableName="Components.tables.accountvendorcredentials"
        tableKey={this.props.tableKey}
        initialTableStateOverride={this.props.initialTableStateOverride}
        defaultTableState={{
          sort: {
            sortKey: 'name',
            orderIn: 'asc',
            tieBreakKey: 'id',
          },
        }}
        data={{
          items: accountVendorCredentials,
          count: _try(() => Object.keys(accountVendorCredentials).length, 0),
        }}
        itemOrder={_try(() => filteredAndSortedItems, [])}
        columns={this.state.columns}
        rowRenderer={rowRenderer}
        typeForNoDataText="Vendor Credentials"
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_accountvendorcredentials);


