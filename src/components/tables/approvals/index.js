import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import { ButtonDropdown, Button, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import numeral from 'numeral';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    invoices: state.account.invoices.data.items,
    status: state.account.invoices.status,
    // TODO implement real approval permissions
    userId: state.user.profile.data.item._id,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    updateInvoice: (data) => {
      return dispatch(Store.account.updateInvoice(data));
    },
  });
};



class components_tables_approvals extends Component {

  state = {
    searchText: '',
    columns: [
      { label: 'Vendor', dataKey: 'vendorName', sort: true },
      { label: 'Invoice #', dataKey: 'invoiceNumber', sort: true },
      { label: 'Chart of Account', dataKey: 'chartOfAccount', sort: true, default: '--' },
      { label: 'Invoice Date', dataKey: 'invoiceDate', sort: true, default: '--' },
      { label: 'Amount', dataKey: 'amount', sort: true, cellRenderer: amount => numeral(amount).format('$0,0.00') },
      { label: 'Due Date', dataKey: 'dueDate', sort: true, default: '--' },
      { label: 'Actions', dataKey: '_id', cellRenderer: id => this.renderActionButton(id) },
    ],
    dropdownOpen: false,
  }



  on = {
    searchChange: e => this.setState({ searchText: e.target.value }),
    approve: (id) => {
      this.props.updateInvoice({
        _id: id,
        status: 'ready',
      });
    },
  }

  toggle = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }

  renderActionButton = id => (
    <ButtonDropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
      <Button id="caret" onClick={() => this.on.approve(id)} color="primary">Approve</Button>
      <DropdownToggle caret color="primary" />
      <DropdownMenu>
        <DropdownItem onClick={() => this.on.approve(id)}>Approve</DropdownItem>
        <DropdownItem>Reject</DropdownItem>
        <DropdownItem>Need Info</DropdownItem>
        <DropdownItem>Remind</DropdownItem>
      </DropdownMenu>
    </ButtonDropdown>
  )

  render() {
    const { invoices, status } = this.props;
    const { columns, searchText } = this.state;
    if (!status.fetched) return <Components.spinner />;

    // TODO implement real approval permissions
    const data = Object.values(invoices).filter(invoice => invoice.status === 'pendingApproval');

    return (
      <div className="components_tables_approvals">
        <div className="row">
          <div className="col-md-3 mb-2 mt-2 mt-md-1 mb-md-4">
            <h6>Search</h6>
            <input type="text" className="form-control small" onChange={this.on.searchChange} value={searchText} />
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
        />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_approvals);


