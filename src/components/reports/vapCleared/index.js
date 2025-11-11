
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
      dispatch(Store.router.openModal('Components.modals.reportschedule', { type: 'vapCleared', columns, renderColumns, orderBy, exports: 'dat', schedule: 'immediate', uniqueExportFormat: { dat: { display: 'DAT' } } }));
    },
    clearTransactions: () => {
      dispatch(Store.transactionDetails.clear());
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_reports_vapCleared extends Component {

  state = {
    dropdownIsOpen: false,
    startDate: _getStartDate(),
    endDate: _getEndDate(),
    orderBy: {
      dataField: '_ref',
      direction: 'desc',
    },
    selectedColumns: [
      { dataField: 'Conglomerate Number', text: 'CongolmerateNumber', skipQuery: true, type: 'Char' },
      { dataField: 'Company Number', text: 'CompanyNumber', type: 'Char' },
      { dataField: 'Account Number', text: 'AccountNumber', type: 'Char' },
      { dataField: 'Company Name', text: 'CompanyName', skipQuery: true, type: 'Char' },
      { dataField: 'Card Last 4', text: 'CardLast4', type: 'Char' },
      { dataField: 'Card CTS', text: 'CardCTS', type: 'Char' },
      { dataField: 'Card BIN Type', text: 'CardBINType', type: 'Char' },
      { dataField: 'Cardholder', text: 'CardholderName', type: 'Char' },
      { dataField: 'Merchant ID', text: 'MerchantID', type: 'Char' },
      { dataField: 'Merchant DBA', text: 'MerchantDBA', type: 'Char' },
      { dataField: 'Merchant City', text: 'MerchantCity', type: 'Char' },
      { dataField: 'Merchant State', text: 'MerchantState', type: 'Char' },
      { dataField: 'Merchant Zip/Postal Code', text: 'MerchantZip', type: 'Char' },
      { dataField: 'Country Code', text: 'MerchantCode', type: 'Char' },
      { dataField: 'Memo Date', text: 'MemoDate', type: 'Char' },
      { dataField: 'Memo Time', text: 'MemoTime', type: 'Char' },
      { dataField: 'Process Date', text: 'ProcessDate', type: 'Char' },
      { dataField: 'Process Time', text: 'ProcessTime', type: 'Char' },
      { dataField: 'Transaction Date', text: 'TransDate', type: 'Char' },
      { dataField: 'Transaction Time', text: 'TransTime', type: 'Char' },
      { dataField: 'Authorization Code', text: 'AuthorizationCode', type: 'Char' },
      { dataField: 'Clearing Reference Number', text: 'ClearingReferenceNumber', type: 'Char' },
      { dataField: 'Cleared Amount', text: 'Cleared Amount', type: 'Char' },
      { dataField: 'Tax Amount', text: 'Tax Amount', type: 'Char' },
      { dataField: 'Record Type', text: 'Record Type', type: 'Char' },
      { dataField: 'Transaction Type', text: 'Transaction Type', type: 'Char' },
      { dataField: 'Transaction Currency', text: 'Transaction Currency', type: 'Char' },
      { dataField: 'Exchange Rate', text: 'Exchange Rate', type: 'Char' },
      { dataField: 'Customer Billed Amount', text: 'Customer Billed Amount', type: 'Char' },
      { dataField: 'Interchange Fee', text: 'InterchangeFee', type: 'Char' },
      { dataField: 'Interchange Rate', text: 'InterchangeRate', type: 'Char' },
      { dataField: 'Interchange Rate Designator', text: 'InterchangeRateDesignator', type: 'Char' },
      { dataField: 'Transaction Category Code (TCC)', text: 'TransactionCategoryCode', type: 'Char' },
      { dataField: 'Merchant Category Code (MCC)', text: 'MerchantCategoryCode', type: 'Char' },
      { dataField: 'Customer Code', text: 'CustomerCode', type: 'Char' },
      { dataField: 'GL Code', text: 'GLCode', type: 'Char' },
      { dataField: 'GL Description', text: 'GLDescription', type: 'Char' },
      { dataField: 'Customer Fee', text: 'CustomerFeeAmount', type: 'Char' },
      { dataField: 'Conversion Fee', text: 'ConversionFeeAmount', type: 'Char' },
      { dataField: 'Create ID', text: 'VCCreateID', type: 'Char' },
      { dataField: 'Create Date', text: 'VCCreateDate', type: 'Char' },
      { dataField: 'Create Time', text: 'VCCreateTime', type: 'Char' },
      { dataField: 'Card Balance', text: 'VCCard Balance', type: 'Char' },
      { dataField: 'Max Number of Uses', text: 'VCMaxNumberofUses', type: 'Char' },
      { dataField: 'Transaction Count', text: 'TransactionCount', type: 'Char' },
      { dataField: 'Issue Amount', text: 'IssueAmount', type: 'Char' },
      { dataField: 'Expiration Date', text: 'Expiration Date', type: 'Char' },
      { dataField: 'Exact Match Flag', text: 'ExactMatchFlag', type: 'Char' },
      { dataField: 'Card Typed', text: 'CardTyper', skipQuery: true, type: 'Char' },
      { dataField: 'Vendor Code', text: 'VendorCode', skipQuery: true, type: 'Char' },
      { dataField: 'Vendor Sub Code', text: 'Vendor Sub Code', skipQuery: true, type: 'Char' },
      { dataField: 'Vendor Name', text: 'VendorName', type: 'Char' },
      { dataField: 'Net Payment Amount', text: 'NetPaymentAmount', type: 'Char' },
      { dataField: 'Payment Date', text: 'PaymentDate', skipQuery: true, type: 'Char' },
      { dataField: 'Payment Notif Sent Date', text: 'PaymentNotifSentDate', skipQuery: true, type: 'Char' },
      { dataField: 'Payment Processed Amount', text: 'PaymentProcessedAmount', skipQuery: true, type: 'Char' },
      { dataField: 'Payment Process Date', text: 'PaymentProcessDate', type: 'Char' },
      { dataField: 'File Number', text: 'FileNumber', type: 'Char', isCustomField: true },
      { dataField: 'Payment ID', text: 'PaymentID', type: 'Char', skipQuery: true },
      { dataField: 'Check Number', text: 'CheckNumber', type: 'Char', isCustomField: true },
      { dataField: 'Batch ID', text: 'BatchID', type: 'Char', isCustomField: true },
      { dataField: 'Customer Payment ID', text: 'CustomerPaymentID', type: 'Char', isCustomField: true },
    ],
    renderedColumns: [
      { dataField: 'Conglomerate Number', skipQuery: true, type: 'Char' },
      { dataField: 'Company Number', text: 'CompanyNumber', type: 'Char' },
      { dataField: 'Account Number', text: 'AccountNumber', type: 'Char' },
      { dataField: 'Company Name', text: 'CompanyName', skipQuery: true, type: 'Char' },
      { dataField: 'Card Last 4', text: 'CardLast4', type: 'Char' },
      { dataField: 'Card CTS', text: 'CardCTS', type: 'Char' },
      { dataField: 'Card BIN Type', text: 'CardBINType', type: 'Char' },
      { dataField: 'Cardholder', text: 'CardholderName', type: 'Char' },
      { dataField: 'Merchant ID', text: 'MerchantID', type: 'Char' },
      { dataField: 'Merchant DBA', text: 'MerchantDBA', type: 'Char' },
      { dataField: 'Merchant City', text: 'MerchantCity', type: 'Char' },
      { dataField: 'Merchant State', text: 'MerchantState', type: 'Char' },
      { dataField: 'Merchant Zip/Postal Code', text: 'MerchantZip', type: 'Char' },
      { dataField: 'Country Code', text: 'MerchantCode', type: 'Char' },
      { dataField: 'Memo Date', text: 'MemoDate', type: 'Char' },
      { dataField: 'Memo Time', text: 'MemoTime', type: 'Char' },
      { dataField: 'Process Date', text: 'ProcessDate', type: 'Char' },
      { dataField: 'Process Time', text: 'ProcessTime', type: 'Char' },
      { dataField: 'Transaction Date', text: 'TransDate', type: 'Char' },
      { dataField: 'Transaction Time', text: 'TransTime', type: 'Char' },
      { dataField: 'Authorization Code', text: 'AuthorizationCode', type: 'Char' },
      { dataField: 'Clearing Reference Number', text: 'ClearingReferenceNumber', type: 'Char' },
      { dataField: 'Cleared Amount', text: 'Cleared Amount', type: 'Char' },
      { dataField: 'Tax Amount', text: 'Tax Amount', type: 'Char' },
      { dataField: 'Record Type', text: 'Record Type', type: 'Char' },
      { dataField: 'Transaction Type', text: 'Transaction Type', type: 'Char' },
      { dataField: 'Transaction Currency', text: 'Transaction Currency', type: 'Char' },
      { dataField: 'Exchange Rate', text: 'Exchange Rate', type: 'Char' },
      { dataField: 'Customer Billed Amount', text: 'Customer Billed Amount', type: 'Char' },
      { dataField: 'Interchange Fee', text: 'InterchangeFee', type: 'Char' },
      { dataField: 'Interchange Rate', text: 'InterchangeRate', type: 'Char' },
      { dataField: 'Interchange Rate Designator', text: 'InterchangeRateDesignator', type: 'Char' },
      { dataField: 'Transaction Category Code (TCC)', text: 'TransactionCategoryCode', type: 'Char' },
      { dataField: 'Merchant Category Code (MCC)', text: 'MerchantCategoryCode', type: 'Char' },
      { dataField: 'Customer Code', text: 'CustomerCode', type: 'Char' },
      { dataField: 'GL Code', text: 'GLCode', type: 'Char' },
      { dataField: 'GL Description', text: 'GLDescription', type: 'Char' },
      { dataField: 'Customer Fee', text: 'CustomerFeeAmount', type: 'Char' },
      { dataField: 'Conversion Fee', text: 'ConversionFeeAmount', type: 'Char' },
      { dataField: 'Create ID', text: 'VCCreateID', type: 'Char' },
      { dataField: 'Create Date', text: 'VCCreateDate', type: 'Char' },
      { dataField: 'Create Time', text: 'VCCreateTime', type: 'Char' },
      { dataField: 'Card Balance', text: 'VCCard Balance', type: 'Char' },
      { dataField: 'Max Number of Uses', text: 'VCMaxNumberofUses', type: 'Char' },
      { dataField: 'Transaction Count', text: 'TransactionCount', type: 'Char' },
      { dataField: 'Issue Amount', text: 'IssueAmount', type: 'Char' },
      { dataField: 'Expiration Date', text: 'Expiration Date', type: 'Char' },
      { dataField: 'Exact Match Flag', text: 'ExactMatchFlag', type: 'Char' },
      { dataField: 'Card Typed', text: 'CardTyper', skipQuery: true, type: 'Char' },
      { dataField: 'Vendor Code', text: 'VendorCode', skipQuery: true, type: 'Char' },
      { dataField: 'Vendor Sub Code', text: 'Vendor Sub Code', skipQuery: true, type: 'Char' },
      { dataField: 'Vendor Name', text: 'VendorName', type: 'Char' },
      { dataField: 'Net Payment Amount', text: 'NetPaymentAmount', type: 'Char' },
      { dataField: 'Payment Date', text: 'PaymentDate', skipQuery: true, type: 'Char' },
      { dataField: 'Payment Notif Sent Date', text: 'PaymentNotifSentDate', skipQuery: true, type: 'Char' },
      { dataField: 'Payment Processed Amount', text: 'PaymentProcessedAmount', skipQuery: true, type: 'Char' },
      { dataField: 'Payment Process Date', text: 'PaymentProcessDate', type: 'Char' },
      { dataField: 'File Number', text: 'FileNumber', type: 'Char', isCustomField: true },
      { dataField: 'Payment ID', text: 'PaymentID', type: 'Char', skipQuery: true },
      { dataField: 'Check Number', text: 'CheckNumber', type: 'Char', isCustomField: true },
      { dataField: 'Batch ID', text: 'BatchID', type: 'Char', isCustomField: true },
      { dataField: 'Customer Payment ID', text: 'CustomerPaymentID', type: 'Char', isCustomField: true },
    ],
    actions: ['Schedule'],
  };

  componentWillMount() { }

  componentDidMount() { }

  componentWillReceiveProps() { }

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
              <div style={{ maxHeight: '49px' }} className="text-center">There is no preview available for this file type WEX.</div>

            </Fragment>
          )
        }
      </ToolkitProvider>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_reports_vapCleared);

// Internal Helper Functions ...
const _getEndDate = () => {
  return new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
};

const _getStartDate = () => {
  return new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setHours(0, 0, 0, 0)).toISOString();
};

// GENERATOR_TYPE='component';
