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
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openInvoiceLabellerModal: (id) => {
      dispatch(Store.router.openModal('Components.modals.invoicelabeller.modal', { id }));
    },
  });
};

class components_tables_inbox extends Component {

  state = {
    searchText: '',
    filterValue: '',
    rowsToDisplay: 25,
    columns: [
      { label: 'Source', dataKey: 'source', sort: true, cellRenderer: source => Utils.capitalize(source) },
      { label: 'From', dataKey: 'vendorName', sort: true, default: '--' },
      { label: 'Due Date', dataKey: 'dueDate', sort: true, cellRenderer: date => this.renderDate(date) },
      { label: '', dataKey: 'currency', sort: true, default: '', cellRenderer: currency => <span className="currency"><Components.badges.status data={currency.toUpperCase()} /></span> },
      { label: 'Actions', dataKey: 'id', cellRenderer: id => <Components.button data={id} buttonText={this.props.invoices[id].status === 'created' ? 'Processing' : 'Review'} onClick={() => this.on.review(id)} disabled={this.props.invoices[id].status === 'created'} /> },
    ],
    filterOptions: [
      { text: 'All', value: 'all' },
      { text: 'Mailbox', value: 'mailbox' },
      { text: 'Email', value: 'email' },
      { text: 'ERP', value: 'erp' },
      { text: 'Uploaded', value: 'uploaded' },
    ],
  }

  componentDidMount() {}
  componentWillUnmount() {}

  
  on = {
    searchChange: e => this.setState({ searchText: e.target.value }),
    filterChange: (e) => {
      if (e.target.value === 'all') this.setState({ filterBy: null, filterValue: '' });
      else this.setState({ filterBy: 'source', filterValue: e.target.value });
    },
    rowsToDisplayChange: e => this.setState({ rowsToDisplay: e.target.value }),
    review: id => this.props.openInvoiceLabellerModal(id),
  }

  renderAmount = (amount) => {
    return amount !== '--' ? numeral(amount).format('$0,0.00') : '--';
  }

  renderDate = (date) => {
    return date ? Utils.dates.dateToDay(new Date(date), 'dayOnly') : '--';
  }

  renderAttachment = (id) => {
    const { status, attachment } = this.props.invoices[id];
      return (status !== 'created') ? (
        <div style={{ width: '60px', 'min-height': '80px' }}>
          <Components.containers.image alt="Invoice Thumbnail" className="p-0 shadow-sm" path={attachment.storagePath} />
        </div> 
      )
      : (
        <div className="shadow-sm" style={{ width: '60px', height: '80px' }}>
          <Components.horizontalLoader />
        </div> 

      );
  }

  render() {
    const { invoices, status } = this.props;
    const { columns, filterBy, filterValue, filterOptions, searchText, rowsToDisplay } = this.state;
    if (!status.fetched) return <Components.spinner />;
    
    const data = Object.values(invoices).filter(invoice => invoice.status !== 'submitted');

    return (
      <div className="components_tables_inbox">
        <div className="row">
          <div className="col-md-3 mb-2 mt-2 mt-md-1 mb-md-4">
            <h6>Search</h6>
            <input type="text" className="form-control small" onChange={this.on.searchChange} value={searchText} />
          </div>
          <div className="col-md-3 mb-2 mt-2 mt-md-1 mb-md-4">
            <Components.tables.components.filterform 
              filterBy="Inbox"
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
          data={data}
          doNotExpand
          noDataText={(searchText) ? 'No Matching Invoices' : 'No Invoices'}
          orderIn="desc"
          sortBy="_createdAt"
          searchText={searchText}
          filter={{ filterBy, filterValue }}
          paginatedTable
          rowsPerPage={rowsToDisplay}
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_inbox);

// Internal Helper Functions ... 
const _statusColor = {
  ready: 'success',
  pendingReview: 'warning',
  created: 'secondary',
};
// GENERATOR_TYPE='component';
