import { connect, Component, bindActionCreators, Fragment } from 'component';
import Utils from 'utils';
import Selectors from 'selectors';
import Components from 'components';


const mapStateToProps = (state, props) => {
  return ({
    lineItems: Selectors.tableData.lineItems(props.tableKey)(state),
    filteredAndSortedItems: Selectors.tableItems('Components.tables.lineItems', props.tableKey, `Selectors.tableData.lineItems(${props.tableKey})(state)`)(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_tables_lineItems extends Component {
  state = {
    columns: [
      { label: 'Total', dataKey: 'amount', sortable: true, cellRenderer: amount => (!amount ? <i>-</i> : Utils.numeral()(amount).format('$0,0.00')) },
      { label: 'Balance', dataKey: 'balance', sortable: true, cellRenderer: balance => (!balance ? <i>-</i> : Utils.numeral()(balance).format('$0,0.00')) },
      { label: 'Discount', dataKey: 'discount', sortable: true, cellRenderer: discount => (!discount ? <i>-</i> : Utils.numeral()(discount).format('$0,0.00')) },
      { label: 'Date', dataKey: 'date', sortable: true, cellRenderer: date => (!date ? <i>-</i> : date) },
      { label: 'Invoice Number', dataKey: 'invoice', sortable: true, cellRenderer: invoice => (!invoice ? <i>-</i> : invoice) },
      { label: 'Description', dataKey: 'description', sortable: true, cellRenderer: description => (!description ? <i>-</i> : description) },
    ],
  };

  componentDidMount() {}
  componentWillUnmount() {}

  render() {
    const { columns } = this.state;
    const { filteredAndSortedItems = [], lineItems = {} } = this.props;
    return (
      <Fragment>
        {!this.props.hideFilter &&
          <Components.tables.components.multiFilter
            tableName="Components.tables.lineItems"
            tableKey={this.props.tableKey || 'default'}
            filterConfig={filterConfig.multiFilter}
          />
        }
        <Components.tables.components.collapsibleTable
          tableName="Components.tables.lineItems"
          tableKey={this.props.tableKey}
          initialTableStateOverride={this.props.initialTableStateOverride}
          defaultTableState={{
            filters: {},
            sort: {
              sortKey: 'id',
              orderIn: 'desc',  
            },
          }}
          data={{
            items: lineItems,
            count: _try(() => Object.keys(lineItems).length, 0),
          }}
          itemOrder={filteredAndSortedItems}
          columns={columns}
          typeForNoDataText="Line Items"
          doNotExpand
          nestedTable
          paginate
          initialRowsPerPage={10}
          hideRowsPerPageSelector
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_tables_lineItems);

// Internal Helper Functions ... 
const filterConfig = {
  multiFilter: {
    amount: {
      key: 'amount',
      type: 'number',
      display: 'Total',
    },
    balance: {
      key: 'balance',
      type: 'number',
      display: 'Balance',
    },
    discount: {
      key: 'discount',
      type: 'number',
      display: 'Discount',
    },
    invoice: {
      key: 'invoice',
      type: 'string',
      display: 'Invoice Number',
    },
  },
  originalFilter: {},
};

