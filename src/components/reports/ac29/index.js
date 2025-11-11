
import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports...
// import { CSVLink } from 'react-csv';
// import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
// import paginationFactory from 'react-bootstrap-table2-paginator';
// import overlayFactory from 'react-bootstrap-table2-overlay';
// import numeral from 'numeral';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    status: state.account.cardsIntegration.status,
    organizationId: state.organization.data.id,
    accountId: state.account.data.id,
    accounts: state.accounts.data.items,
    forms: state.forms,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    fetchTransactions: (startDate, endDate, fields) => {
      return dispatch(Store.transactionDetails.fetch(startDate, endDate, fields));
    },
    openReportScheduleModal: (columns, renderColumns, orderBy) => {
      dispatch(Store.router.openModal('Components.modals.reportschedule', { type: 'ac29', columns, renderColumns, orderBy, exports: 'generic', schedule: 'daily', uniqueExportFormat: { generic: { display: 'Comdata TXT' } } }));
    },
    clearTransactions: () => {
      dispatch(Store.transactionDetails.clear());
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_reports_recon extends Component {

  state = {
    dropdownIsOpen: false,
    startDate: _getStartDate(),
    endDate: _getEndDate(),
    orderBy: {
      dataField: '_ref',
      direction: 'desc',
    },
    selectedColumns: [
      { dataField: 'Cleared Amount', type: 'Num' },
      { dataField: 'Customer Billed Amount', type: 'Num' },
      { dataField: 'Clearing Reference Number', type: 'Char' },
      { dataField: 'Card Last 4', type: 'Num' },
      { dataField: 'Vendor Name', type: 'Char' },
      { dataField: 'Transaction Date', type: 'Char' },
      { dataField: 'Process Date', type: 'Char' },
      { dataField: 'Check Number', type: 'Char', isCustomField: true },
      { dataField: 'Comdata Account Number', type: 'Char', isCustomField: true },
      { dataField: 'Comdata Account Code One', type: 'Char', isCustomField: true },
      { dataField: 'Customer Id', type: 'Char', isCustomField: true },
      { dataField: 'Repair Order Number', type: 'Char', isCustomField: true },
    ],
    renderedColumns: [
      { dataField: 'Cleared Amount', text: 'Cleared Amount', type: 'Cur' },
      { dataField: 'Customer Billed Amount', text: 'Billed Amount', type: 'Cur' },
      { dataField: 'Clearing Reference Number', text: 'Clearing Ref #', type: 'Char' },
      { dataField: 'Vendor Name', text: 'Vendor Name', type: 'Char' },
      { dataField: 'Card Last 4', text: 'Card Last 4', type: 'Num' },
      { dataField: 'Transaction Date', text: 'Transaction Date', type: 'Char' },
      { dataField: 'Process Date', text: 'Process Date', type: 'Char' },
      { dataField: 'Check Number', text: 'Check Number', type: 'Char', isCustomField: true },
      { dataField: 'Comdata Account Number', text: 'Comdata Account Number', type: 'Char', isCustomField: true },
      { dataField: 'Customer Id', text: 'Customer Id', type: 'Char', isCustomField: true },
      { dataField: 'Comdata Account Code One', text: 'Comdata Account Code One', type: 'Char', isCustomField: true },
      { dataField: 'Repair Order Number', text: 'Repair Order Number', type: 'Char', isCustomField: true },
    ],
    actions: ['Schedule'],
  };

  componentWillMount() {}

  componentDidMount() {}

  componentWillReceiveProps() {}

  componentWillUnmount() { }

  handleScheduleReport = () => {
    const { selectedColumns, renderedColumns, orderBy } = this.state;
    this.props.openReportScheduleModal(selectedColumns, renderedColumns, orderBy);
  };

  render() {
    return (
      <ToolkitProvider
        bootstrap4
        keyField="_id"
        data={[]}
        columns={[]}
      >
        {
          props => (
            <Fragment>
              <div className={'row'}>
                <div className={'col-11'}>
                  <Components.forms.reportsearch
                    {...props.searchProps}
                  />
                </div>
                <div className={'col-1 text-center'}>
                  <Dropdown isOpen={this.state.dropdownIsOpen} toggle={() => this.setState((prevState) => { return { dropdownIsOpen: !prevState.dropdownIsOpen }; })}>
                    <DropdownToggle caret className={'btn btn-outline-primary'}>
                      {'Actions'}
                    </DropdownToggle>
                    <DropdownMenu right>
                      {this.state.actions.map((action) => {
                        if (action === 'Actions') return false;
                        if (action === 'Schedule') {
                          return (
                            <DropdownItem onClick={() => this.handleScheduleReport()}>
                              <span className="mdi mdi-calendar-clock">&nbsp;&nbsp;{action}</span>
                            </DropdownItem>
                          );
                        }
                        return (
                          <DropdownItem onClick={() => { }}>
                            {action}
                          </DropdownItem>);
                      })}
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
              <div style={{ maxHeight: '49px' }} className="text-center">There is no preview available for this file type.</div>

            </Fragment>
          )
        }
      </ToolkitProvider>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_reports_recon);

// Internal Helper Functions ...
const _getEndDate = () => {
  return new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
};

const _getStartDate = () => {
  return new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setHours(0, 0, 0, 0)).toISOString();
};

// GENERATOR_TYPE='component';
