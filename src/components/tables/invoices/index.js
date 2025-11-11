import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    invoices: state.account.invoices.data.items,
    status: state.account.invoices.status,
    paymentStatuses: state.account.paymentStatuses.data.items,
    routeParams: state.router.route.params,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openInvoiceLabellerModal: (id) => {
      dispatch(Store.router.openModal('Components.modals.invoicelabeller.modal', { id }));
    },
  });
};

class components_tables_invoices extends Component {
  state = {
    searchText: '',
    filterValue: '',
    rowsToDisplay: 25,
    columns: [
      { label: 'Status', dataKey: 'status', sort: true, cellRenderer: status => <Components.badges.status data={_adaptStatus[status] || status} color={status === 'paid' && 'primary'} /> },
      { label: '', dataKey: 'id', cellRenderer: id => this.renderThumbnail(id) },
      { label: 'Received', dataKey: '_createdAt', sort: true, cellRenderer: date => Utils.dates.dateToDay(new Date(date), 'dayOnly') },
      { label: 'Vendor', dataKey: 'vendorName', sort: true, default: '--' },
      { label: 'Invoice #', dataKey: 'invoiceNumber', sort: true, default: '--' },
      // { label: 'Chart of Account', dataKey: 'chartOfAccount', sort: true, default: '--' },
      { label: 'Invoice Date', dataKey: 'invoiceDate', sort: true, cellRenderer: date => this.renderDate(date) },
      { label: 'Due Date', dataKey: 'dueDate', sort: true, cellRenderer: date => this.renderDate(date) },
      // { label: 'Method', dataKey: 'method', sort: true, default: 'vCard', cellRenderer: (data) => { return <Components.badges.acceptsmethod data={data} />; } },
      { label: 'Amount', dataKey: 'id', sort: true, default: '--', cellRenderer: id => this.renderAmount(id) },
      { label: 'Actions', dataKey: 'id', cellRenderer: id => this.deriveActions(id) },
    ],
    filterOptions: [
      { text: 'All', value: 'all' },
      { text: 'Processing', value: 'processing' },
      { text: 'Reviewing', value: 'reviewing' },
      { text: 'Paid', value: 'paid' },
    ],
  }

  componentDidMount() { }
  componentWillUnmount() { }

  deriveActions = (id) => {
    return this.props.invoices[id].status === 'reviewing' ? <Components.button data={id} buttonText="Review" onClick={(e) => { e.stopPropagation(); this.on.review(id); }} disabled={this.props.invoices[id].status === 'processing'} /> : null;
  }

  on = {
    searchChange: e => this.setState({ searchText: e.target.value }),
    filterChange: (e) => {
      if (e.target.value === 'all') this.setState({ filterBy: null, filterValue: '' });
      else this.setState({ filterBy: 'status', filterValue: e.target.value });
    },
    rowsToDisplayChange: e => this.setState({ rowsToDisplay: e.target.value }),
    review: id => this.props.openInvoiceLabellerModal(id),
  }

  rowRenderer = (rowData) => {
    return (
      <Components.overviews.invoice id={rowData.id} />
    );
  };

  renderAmount = (id) => {
    const { amount, currency } = this.props.invoices[id];
    if (!amount) return '--';
    return (
      <Fragment>{numeral(amount).format('$0,0.00')}
        <span className="pb-1 ps-1 align-top currency"><Components.badges.status data={currency.toUpperCase()} /></span>
      </Fragment>
    );
  }

  renderThumbnail = (id) => {
    const { status, attachment } = this.props.invoices[id];
    return (status !== 'processing') ? (
      <div style={{ width: '40px', 'min-height': '60px' }}>
        <Components.containers.image alt="Invoice Thumbnail" thumbnail className="p-0 shadow-sm" path={attachment.storagePath} />
      </div>
    )
      : (
        <div className="shadow-sm" style={{ width: '40px', height: '60px' }}>
          <Components.horizontalLoader height="7px" />
        </div>

      );
  }

  renderDate = (date) => {
    return date ? Utils.dates.dateToDay(new Date(date), 'UTCDayOnly') : '--';
  }

  render() {
    const { invoices, status } = this.props;
    const { columns, filterBy, filterValue, filterOptions, searchText, rowsToDisplay } = this.state;
    if (!status.fetched) return <Components.spinner />;
    const data = Object.values(invoices);

    return (
      <div className="components_tables_invoices">
        <div className="row">
          <div className="col-md-3 mb-2 mt-2 mt-md-1 mb-md-4">
            <h6>Search</h6>
            <input type="text" className="form-control small" onChange={this.on.searchChange} value={searchText} />
          </div>
          <div className="col-md-3 mb-2 mt-2 mt-md-1 mb-md-4">
            <Components.tables.components.filterform
              filterBy="Status"
              onChange={this.on.filterChange}
              options={filterOptions}
            />
          </div>
          <div className="col-md-2 offset-md-4 mb-2 mt-2 mt-md-1 mb-md-4">
            <h6>Rows to Display</h6>
            <select className="form-control small" onChange={this.on.rowsToDisplayChange}>
              <option value={10}>10</option>
              <option value={25} selected >25</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        <Components.tables.components.collapsabletable
          columns={columns}
          rowRenderer={this.rowRenderer}
          data={data}
          sortBy="_createdAt"
          orderIn="desc"
          noDataText={(searchText) ? 'No Matching Invoices' : 'No Invoices'}
          defaultSelectedItemId={this.props.routeParams.invoice || null}
          defaultIdLabel="id"
          searchText={searchText}
          filter={{ filterBy, filterValue }}
          paginatedTable
          rowsPerPage={rowsToDisplay}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_invoices);

// Internal Helper Functions ...
const _adaptStatus = {
  pendingApproval: 'Pending Approval',
  ready: 'Ready to Pay',
};
// GENERATOR_TYPE='component';
