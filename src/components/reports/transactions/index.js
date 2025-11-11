import { connect, Component } from 'component';
import { createRef } from 'react';

// Third Party Imports ...
import { CSVLink } from 'react-csv';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';

// import Utils from 'utils';
import Components from 'components';
import Store from 'store';

import { cannedFields } from 'components/forms/components/customreportfield/reportFields';
import './index.scss';

const fieldDict = cannedFields.reduce(((acc, field) => {
  acc[field.name] = field;
  return acc;
}), {});

const mapStateToProps = (state) => ({
  transactions: state.transactionDetails.data.items,
  transactionMessage: state.transactionDetails.data.message || '',
  status: state.transactionDetails.status,
  organizationId: state.organization.data.id,
  accountId: state.account.data.id,
  forms: state.forms,
});

const mapDispatchToProps = (dispatch, props) => ({
  fetchTransactions: (startDate, endDate, fields) => dispatch(Store.transactionDetails.fetch(startDate, endDate, fields)),
  openReportScheduleModal: (columns, orderBy, includeLineItems) => {
    dispatch(Store.router.openModal(
      'Components.modals.reportschedule',
      {
        type: 'transaction',
        columns,
        orderBy,
        includeLineItems,
      }
    ));
  },
  openReportCustomizeModal: (selected, onSave) => {
    dispatch(Store.router.openModal('Components.modals.reportcustomize', { selected, onSave }));
  },
  clearTransactions: () => {
    dispatch(Store.transactionDetails.clear());
  },
});

const _getEndDate = () => new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

const _getStartDate = () => new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setHours(0, 0, 0, 0)).toISOString();

const sortCaret = (order, column) => {
  if (order === 'asc') {
    return (<>&nbsp;<i className={'mdi mdi-chevron-down'} /></>);
  }
  if (order === 'desc') {
    return (<>&nbsp;<i className={'mdi mdi-chevron-up'} /></>);
  }
  return (<>&nbsp;<i className={'mdi mdi-chevron-up'} /><i className={'mdi mdi-chevron-down'} /></>);
};

const sortNumbers = (a, b, order, dataField, rowA, rowB) => {
  if (order === 'asc') {
    return parseFloat(a) - parseFloat(b);
  } // desc
  return parseFloat(b) - parseFloat(a);
};

const sortDates = (a, b, order, dataField, rowA, rowB) => {

  const parsedA = isNaN(new Date(_getDateString(a)).getTime()) ? 0 : new Date(_getDateString(a)).getTime();
  const parsedB = isNaN(new Date(_getDateString(b)).getTime()) ? 0 : new Date(_getDateString(b)).getTime();
  if (order === 'asc') {
    return parseFloat(parsedA) - parseFloat(parsedB);
  } // desc
  return parseFloat(parsedB) - parseFloat(parsedA);
};

const _getDateString = (string) => {
  if (!string) {
    return '';
  }
  let dateForView;
  try {
    dateForView = `${new Date(`${string.slice(0, 4)}/${string.slice(4, 6)}/${string.slice(6)}`).toISOString().split('T')[0]}`;

  } catch (e) {
    dateForView = '';
  }
  return dateForView;
};

class components_reports_transactions extends Component {

  state = {
    dataTableRef: createRef(),
    startDate: _getStartDate(),
    endDate: _getEndDate(),
    orderBy: {
      dataField: 'Process Date',
      direction: 'desc',
    },
    initialFieldNames: [
      'Process Date',
      'Card CTS',
      'Card BIN Type',
      'Card Last 4',
      'Cleared Amount',
      'Clearing Reference Number',
      'Customer Billed Amount',
    ],
    selectedColumns: [],
    fetched: false,
    dropdownIsOpen: false,
    actions: ['Schedule', 'Export CSV', 'Customize'],
    csvData: [],
    includeLineItems: false,
  };

  componentWillMount() {
    const initialFields = this.state.initialFieldNames.map((name) => ({
      dataField: name,
      type: fieldDict[name] ? fieldDict[name].type : 'Char',
    }));
    const selectedColumns = this.formatColumns(initialFields, true);
    this.setState({ selectedColumns });
  }

  componentWillReceiveProps(nextProps) {
    const {
      status,
      accountId,
      organizationId,
      forms,
    } = nextProps;
    const { selectedColumns } = this.state;

    if (!status.fetching && !this.state.fetched && accountId) {
      const { startDate, endDate } = this.state;
      // Block query here if no card
      this.props.fetchTransactions(startDate, endDate, selectedColumns);
      this.setState({ fetched: true });
    } else if (accountId !== null && organizationId !== null && (accountId !== this.props.accountId || organizationId !== this.props.organizationId)) {
      const { startDate, endDate } = this.state;
      this.props.fetchTransactions(startDate, endDate, selectedColumns);
    }

    if (forms['Components.forms.reportsearch'] && forms['Components.forms.reportsearch'].default && this.props.forms['Components.forms.reportsearch'] && this.props.forms['Components.forms.reportsearch'].default) {
      const { startDate, endDate } = forms['Components.forms.reportsearch'].default;

      if (this.state.startDate !== startDate.value.toISOString() && startDate.focused === false && !startDate.error) {
        this.props.fetchTransactions(startDate.value, endDate.value, selectedColumns);
        this.setState({ startDate: startDate.value.toISOString() });
      }
      if (this.state.endDate !== endDate.value.toISOString() && endDate.focused === false && !endDate.error) {
        this.props.fetchTransactions(startDate.value, endDate.value, selectedColumns);
        this.setState({ endDate: endDate.value.toISOString() });
      }
    }

    if (nextProps.transactions) {
      this.setState({
        csvData: this.getCsvData(nextProps.transactions, selectedColumns, this.state.orderBy),
      });
    }
  }

  componentWillUnmount() {
    this.props.clearTransactions();
  }

  onSave = (selectedColumns = [], includeLineItems) => {
    this.setState({ selectedColumns: this.formatColumns(selectedColumns), includeLineItems });
  };

  onSort = (column, order) => {
    this.setState({
      orderBy: { dataField: column, direction: order },
      csvData: this.getCsvData(this.props.transactions, this.state.selectedColumns, { dataField: column, direction: order }),
    });
  };

  getCsvData = (transactions, selectedColumns, orderBy) => Object.values(transactions)
    .sort((a, b) => {
      const { direction, dataField } = orderBy;
      if (direction === 'asc') {
        if (isNaN(parseFloat(a[dataField]))) {
          if (a[dataField] < b[dataField]) { return -1; }
          if (a[dataField] > b[dataField]) { return 1; }
          return 0;
        }
        return (a[dataField] - b[dataField]);
      }

      if (isNaN(parseFloat(a[dataField]))) {
        if (b[dataField] < a[dataField]) {
          return -1;
        }
        if (b[dataField] > a[dataField]) {
          return 1;
        }
      }
      return b[dataField] - a[dataField];
    })
    .reduce((acc, curr) => {
      acc.push(selectedColumns.map((column) => column.dataField).map((column) => curr[column]));
      return acc;
    }, [selectedColumns.map((column) => column.text)]);

  formatColumns = (fields = [], skipText) => fields.map(({ dataField, type, isCustomField }) => {
    const data = {
      dataField,
      text: skipText ? dataField : this.props.forms['Components.forms.customreportfields'][dataField].fieldName.value,
      type,
      isCustomField,
      sort: true,
      // align: type === 'Cur' ? 'right' : 'left',
      sortCaret,
      formatter: (cell) => {
        if (cell === null || cell === undefined) {
          return '';
        }
        if (type === 'Cur') {
          return _formatCurrency(cell);
        }
        if (type === 'Date') {
          return _getDateString(cell, dataField);
        }
        return cell;
      },
      onSort: this.onSort,
    };
    if (type === 'Num' || type === 'Cur') {
      data.sortFunc = sortNumbers;
    }
    if (type === 'Date') {
      data.sortFunc = sortDates;
    }
    return data;
  });

  handleScheduleReport = () => {
    this.props.openReportScheduleModal(this.state.selectedColumns, this.state.orderBy, this.state.includeLineItems);
  };

  handleCustomize = () => {
    this.props.openReportCustomizeModal(this.state.selectedColumns, this.onSave);
  };

  toggle = () => {
    this.setState((prevState) => ({ dropdownIsOpen: !prevState.dropdownIsOpen }));
  };

  render() {
    const { transactions, status } = this.props;
    const { selectedColumns = [], csvData } = this.state;

    return (
      <ToolkitProvider
        bootstrap4
        keyField="_id"
        data={transactions}
        columns={selectedColumns}
        search
      >
        {
          (props) => (
            <>
              <div className={'row'}>
                <div className={'col-11'}>
                  <Components.forms.reportsearch
                    {...props.searchProps}
                    handleCustomize={this.handleCustomize}
                  />
                </div>
                <div className={'col-1 text-center'}>
                  <Dropdown isOpen={this.state.dropdownIsOpen} toggle={this.toggle}>
                    <DropdownToggle caret className={'btn btn-outline-primary'}>
                      {'Actions'}
                    </DropdownToggle>
                    <DropdownMenu right>
                      {this.state.actions.map((action) => {
                        if (action === 'Actions') { return false; }
                        if (action === 'Customize') {
                          return (
                            <DropdownItem onClick={(e) => this.handleCustomize(e)}>
                              <span className="mdi mdi-cog">&nbsp;&nbsp;{action}</span>
                            </DropdownItem>
                          );
                        }
                        if (action === 'Export CSV') {
                          return (
                            <CSVLink
                              data={csvData}
                              filename="transaction_details.csv"
                              target="_blank"
                              className="dropdown-item"
                            >
                              <span className="mdi mdi-download">&nbsp;&nbsp;{action}</span>
                            </CSVLink>
                          );
                        }
                        if (action === 'Schedule') {
                          return (
                            <DropdownItem onClick={(e) => this.handleScheduleReport(e)}>
                              <span className="mdi mdi-calendar-clock">&nbsp;&nbsp;{action}</span>
                            </DropdownItem>
                          );
                        }
                        return <DropdownItem onClick={() => { }}>{action}</DropdownItem>;
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
                  // If no data here due ot no card say this
                  if (!status.fetched) {
                    return <Components.spinner style={{ minHeight: '300px' }} />;
                  }
                  if (this.props.transactionMessage) {
                    if (this.props.transactionMessage === 'no card assigned') {
                      return <div style={{ maxHeight: '49px' }} className="text-center">You do not have a card assigned to your user.</div>;
                    }
                  }
                  return <div style={{ maxHeight: '49px' }} className="text-center">No matching transaction details.</div>;
                }}
              />
            </>
          )
        }
      </ToolkitProvider>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_reports_transactions);

// Internal Helper Functions ...
// function from stack overflow
const _formatCurrency = (amount) => {
  try {
    const negativeSign = amount < 0 ? '-' : '';
    const i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(2), 10).toString();
    const j = (i.length > 3) ? i.length % 3 : 0;

    return `${negativeSign}$${j ? `${i.substr(0, j)},` : ''}${i.substr(j).replace(/(\d{3})(?=\d)/g, '$1,')}.${Math.abs(amount - i).toFixed(2).slice(2)}`;
  } catch (e) {
    console.log(e);
  }
};

// GENERATOR_TYPE='component';
