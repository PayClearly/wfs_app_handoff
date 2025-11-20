import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Utils from 'utils';
import Components from 'components';


const mapStateToProps = (state, props) => {
  return ({
    paymentCardChangeRequests: state.account.paymentCardChangeRequests.data.items,
    paymentCardChangeRequestsStatus: state.account.paymentCardChangeRequests.status,
    users: state.users.data.items,
    tables: state.tables,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({});
};

class components_tables_paymentCardChangeRequestsFunding extends Component {
  state = {
    columns: [
      { label: 'Amount', dataKey: 'fundingAmount', sortable: true, cellRenderer: FormatAmount },
      { label: 'Date Submitted', dataKey: 'submittedAt', sortable: true, cellRenderer: (date) => { return Utils.dates.dateToDay(date); } },
      { label: 'Increase Type', dataKey: 'formattedType', sortable: false },
      { label: 'Submitted By', dataKey: 'submittedBy', default: '-', sortable: true, cellRenderer: (submittedBy) => { if (submittedBy === '-') return submittedBy; return <Components.badges.createdby user={submittedBy} />; } },
      { label: 'Purchase Card', dataKey: 'paymentCardId', sortable: true, cellRenderer: paymentCardId => (paymentCardId ? <Components.chip refId={paymentCardId} /> : <span />) },
    ],
  };
  componentDidMount() {
    const columns = this.state.columns;

    if (this.props.forFunding) {
      columns.push({ label: '', dataKey: 'actionButton', sortable: false, cellRenderer: this._generateActionButton, headerRenderer: this._generateHeaderActionButton });
    }

    this.setState({ columns });
  }
  componentWillUnmount() {}

  getRowData = (paymentCardCRId) => {
    const { paymentCardChangeRequests } = this.props;
    const paymentCardCR = paymentCardChangeRequests[paymentCardCRId];

    let formattedType = 'Create';
    if (paymentCardCR.type === 'update') {
      formattedType = 'Manual Update';
    } else if (paymentCardCR.type === 'trigger') {
      formattedType = 'Trigger';
    }

    const data = {
      formattedType,
    };

    if (this.props.forFunding) {
      data.actionButton = {
        paymentCardCRId,
        isCancelled: status === 'Cancelled',
      };
    }

    return Object.assign({}, paymentCardCR, data);
  };

  _generateActionButton = (data) => {
    if (data.isCancelled) return null;
    return (
      <span>
        <Components.submitPaymentCardChangeRequestTransferButton
          paymentCardCRId={data.paymentCardCRId}
        />
      </span>);
  };

  _generateHeaderActionButton = () => {
    if (!_try(() => Object.keys(this.props.paymentCardChangeRequestsToDisplay).length > 1)) return null;

    return <Components.submitPaymentCardChangeRequestTransferButton />;
  }

  render() {
    const { paymentCardChangeRequests, paymentCardChangeRequestsStatus, paymentCardChangeRequestsToDisplay, tables } = this.props;
    if (!_try(() => paymentCardChangeRequestsStatus.fetched) || _try(() => paymentCardChangeRequestsStatus.fetching)) return <Components.spinner />;
    const unfundedPaymentCardChangeRequests = _try(() => paymentCardChangeRequestsToDisplay, {});

    const data = {};
    const filteredAndSortedItems = _getPaymentCardChangeRequestItemsForFundingView(Object.keys(unfundedPaymentCardChangeRequests), paymentCardChangeRequests, _try(() => tables['Components.tables.paymentCardChangeRequestsFunding'].default.sort));
    filteredAndSortedItems.forEach((paymentCardCRId) => {
      data[paymentCardCRId] = this.getRowData(paymentCardCRId);
    });

    return (
      <Components.tables.components.collapsibleTable
        tableName="Components.tables.paymentCardChangeRequestsFunding"
        tableKey={this.props.tableKey}
        initialTableStateOverride={this.props.initialTableStateOverride}
        defaultTableState={{
          sort: {
            sortKey: 'submittedAt',
            orderIn: 'desc',
          },
        }}
        data={{
          items: data,
          count: _try(() => Object.keys(data).length, 0),
        }}
        itemOrder={_try(() => filteredAndSortedItems, [])}
        columns={this.state.columns}
        typeForNoDataText="Purchase Card Changes"
        doNotExpand
        paginate
        initialRowsPerPage={25}
        hideRowsPerPageSelector
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_paymentCardChangeRequestsFunding);

// Internal Helper Functions ... 
const FormatAmount = (amount) => {
  return (amount) ? numeral(amount).format('$0,0.00') : null;
};

const _getPaymentCardChangeRequestItemsForFundingView = (ids, items, sortState) => {
  const sortedItems = Utils.tables.sort(ids, items, sortState);
  return sortedItems;
};

