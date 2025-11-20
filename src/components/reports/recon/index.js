
import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports...
import { CSVLink } from 'react-csv';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import numeral from 'numeral';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    transactions: Selectors.transactions(state),
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
      dispatch(Store.router.openModal('Components.modals.reportschedule', { type: 'recon', columns, renderColumns, orderBy }));
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
    csvData: [],
    dropdownIsOpen: false,
    startDate: _getStartDate(),
    endDate: _getEndDate(),
    orderBy: {
      dataField: '_ref',
      direction: 'desc',
    },
    selectedColumns: [
      { dataField: 'status', text: 'Status', type: 'Char' },
      { dataField: '_createdAt', text: 'Payment Date', type: 'Num' },
      { dataField: 'amount', text: 'Amount', type: 'Num' },
      { dataField: 'vendor', text: 'Vendor', type: 'Char' },
      { dataField: 'details', text: 'Details', type: 'Char' },
      { dataField: 'method', text: 'Payment Method', type: 'Char' },
      { dataField: 'username', text: 'Created By', type: 'Char' },
      { dataField: '_ref', text: 'Ref', type: 'Ref' },
      { dataField: 'transactionAmount', text: 'Transaction Amount', type: 'Char' },
      { dataField: 'transactionType', text: 'Transaction Type', type: 'Char' },
    ],
    renderedColumns: [
      { dataField: 'status', text: 'Status', type: 'Char' },
      { dataField: '_createdAt', text: 'Payment Date', type: 'Num' },
      { dataField: 'amount', text: 'Amount', type: 'Num' },
      { dataField: 'vendor', text: 'Vendor', type: 'Char' },
      { dataField: 'details', text: 'Details', type: 'Char' },
      { dataField: 'method', text: 'Payment Method', type: 'Char' },
      { dataField: 'username', text: 'Created By', type: 'Char' },
      { dataField: '_ref', text: 'Ref', type: 'Ref' },
      { dataField: 'transactionAmount', text: 'Transaction Amount', type: 'Char' },
      { dataField: 'transactionType', text: 'Transaction Type', type: 'Char' },
    ],
    actions: ['Schedule', 'Export CSV'],
    transactions: [],
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.transactions) {
      this.setState({
        csvData: this.getCsvData(this.adaptTransactions(nextProps.transactions), this.state.selectedColumns, this.state.orderBy),
      });
    }
  }



  getCsvData = (transactions, selectedColumns, orderBy) => {
    return Object.values(transactions)
      .sort((a, b) => {
        const { direction, dataField } = orderBy;
        if (direction === 'asc') {
          if (isNaN(parseFloat(a[dataField]))) {
            if (a[dataField] < b[dataField]) return -1;
            if (a[dataField] > b[dataField]) return 1;
            return 0;
          }
          return (a[dataField] - b[dataField]);
        }

        if (isNaN(parseFloat(a[dataField]))) {
          if (b[dataField] < a[dataField]) return -1;
          if (b[dataField] > a[dataField]) return 1;
        }
        return b[dataField] - a[dataField];
      })
      .reduce((acc, curr) => {
        acc.push(selectedColumns.map(column => column.dataField).map(column => curr[column]));
        return acc;
      }, [selectedColumns.map(column => column.text)]);
  };

  transactionComparator = (a, b, orderBy) => {
    const { dataField, direction } = orderBy;
    if (direction === 'asc') {
      if (isNaN(parseFloat(a[dataField]))) {
        if (a[dataField] < b[dataField]) return -1;
        if (a[dataField] > b[dataField]) return 1;
        return 0;
      }
      return (a[dataField] - b[dataField]);
    }

    if (isNaN(parseFloat(a[dataField]))) {
      if (b[dataField] < a[dataField]) return -1;
      if (b[dataField] > a[dataField]) return 1;
    }
    return b[dataField] - a[dataField];
  };

  adaptTransactions = (transactions) => {
    return transactions.reduce((acc, transaction, index) => {
      const item = {
        Index: 0,
        status: transaction.status,
        _createdAt: new Date(transaction.created._createdAt).toLocaleDateString("en-US"),
        amount: numeral(transaction.created.amount).format('$0,0.00'),
        vendor: transaction.vendor.name,
        details: [...Object.values((transaction.created.customFields || {})), ...Object.values((transaction.created.paymentFields || {}))].join(' '),
        method: transaction.created.method,
        username: transaction.user ? transaction.user.username || transaction.user.email : 'N/A',
        _ref: transaction._ref,
        transactionAmount: transaction.transactionAmount ? numeral(transaction.transactionAmount).format('$0,0.00') : '',
        transactionType: transaction.transactionType,
      };
      if (item.details.length > 60) item.details = `${item.details.slice(0, 60)}...`;
      item.selectedFields = Object.keys(item);
      acc.push(item);
      return acc;
    }, []);
  };

  formatColumns = (fields = []) => {
    return fields.map(({ dataField, text, type, isCustomField }) => {
      const data = {
        dataField,
        text,
        type,
        isCustomField: isCustomField || false,
        sort: true,
        sortCaret,
        formatter: (cell, row) => {
          if (cell === null || cell === undefined) return '';
          if (type === 'Date') return _getDateString(cell);
          if (type === 'Ref') return `P_${cell}`;
          return cell;
        },
        onSort: this.onSort,
        style: (cell, row, rowIndex, colIndex) => {
          if (colIndex === 1) {
            return {
              'white-space': 'nowrap',
              'text-overflow': 'ellipsis',
              overflow: 'hidden',
              'max-width': '1px',
            };
          }
        },
      };
      if (type === 'Num' || type === 'Cur') data.sortFunc = sortNumbers;
      if (type === 'Date') data.sortFunc = sortDates;
      return data;
    });
  };


  handleScheduleReport = () => {
    const { selectedColumns, renderedColumns, orderBy } = this.state;
    this.props.openReportScheduleModal(selectedColumns, renderedColumns, orderBy);
  };

  render() {
    const { status, transactions } = this.props;
    const { csvData } = this.state;

    const renderedColumns = this.formatColumns(this.state.renderedColumns);

    return (
      <ToolkitProvider
        bootstrap4
        keyField="_id"
        data={this.adaptTransactions(transactions)}
        columns={renderedColumns}
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
                        if (action === 'Export CSV') {
                          return (
                            <CSVLink
                              data={csvData}
                              filename="PC_recon.csv"
                              target="_blank"
                              className="dropdown-item"
                            >
                              <span className="mdi mdi-download">&nbsp;&nbsp;{action}</span>
                            </CSVLink>
                          );
                        }
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
              <BootstrapTable
                {...props.baseProps}
                pagination={paginationFactory()}
                overlay={overlayFactory({ spinner: true, background: 'rgba(192,192,192,0.3)' })}
                bordered={false}
                wrapperClasses={'w-100 pb-5'}
                hover
                loading={status.fetching && status.fetched}
                noDataIndication={() => {
                  if (!status.fetched) return <Components.spinner style={{ minHeight: '300px' }} />;
                  return <div style={{ maxHeight: '49px' }} className="text-center">No matching transaction details.</div>;
                }}
              />
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


const sortCaret = (order) => {
  if (order === 'asc') return (<Fragment>&nbsp;<i className={'mdi mdi-chevron-down'} /></Fragment>);
  if (order === 'desc') return (<Fragment>&nbsp;<i className={'mdi mdi-chevron-up'} /></Fragment>);
  return (<Fragment>&nbsp;<i className={'mdi mdi-chevron-up'} /><i className={'mdi mdi-chevron-down'} /></Fragment>);
};


const sortNumbers = (a, b, order, dataField, rowA, rowB) => {
  if (order === 'asc') return parseFloat(a) - parseFloat(b); // desc
  return parseFloat(b) - parseFloat(a);
};

const sortDates = (a, b, order, dataField, rowA, rowB) => {
  const parsedA = isNaN(new Date(_getDateString(a)).getTime()) ? 0 : new Date(_getDateString(a)).getTime();
  const parsedB = isNaN(new Date(_getDateString(b)).getTime()) ? 0 : new Date(_getDateString(b)).getTime();
  if (order === 'asc') return parseFloat(parsedA) - parseFloat(parsedB); // desc
  return parseFloat(parsedB) - parseFloat(parsedA);
};

const _getDateString = (string) => {
  if (!string) return '';
  return `${new Date(`${string.slice(0, 4)}/${string.slice(4, 6)}/${string.slice(6)}`).toISOString().split('T')[0]}`;
};
