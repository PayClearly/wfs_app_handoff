
import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports...
import { CSVLink } from 'react-csv';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    transactions: state.transactionDetails.data.items,
    customFields: state.account.paymentCardCustomFields.data.item,
    status: state.transactionDetails.status,
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
      dispatch(Store.router.openModal('Components.modals.reportschedule', { type: 'spendByCard', columns, renderColumns, orderBy }));
    },
    clearTransactions: () => {
      dispatch(Store.transactionDetails.clear());
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_reports_spendByCard extends Component {

  state = {
    csvData: [],
    dropdownIsOpen: false,
    startDate: _getStartDate(),
    endDate: _getEndDate(),
    orderBy: {
      dataField: 'Sub Total',
      direction: 'desc',
    },
    selectedColumns: [
      { dataField: 'Card CTS', type: 'Char' },
      { dataField: 'Card Last 4', type: 'Num' },
      { dataField: 'Cleared Amount', type: 'Num' },
      { dataField: 'Customer Billed Amount', type: 'Num' },
      { dataField: 'Clearing Reference Number', type: 'Char' },
      { dataField: 'Ref', text: 'Card Ref #', type: 'Num', isCustomField: true },
      { dataField: 'Created By', text: 'Created By', type: 'Char', isCustomField: true },
      { dataField: 'Cardholder Name', text: 'Cardholder Name', type: 'Char', isCustomField: true },
    ],
    renderedColumns: [
      { dataField: 'Card CTS', text: 'Card CTS', type: 'Char' },
      { dataField: 'Card Last 4', text: 'Card Last 4', type: 'Num' },
      { dataField: 'Cleared Amount', text: 'Cleared Amount', type: 'Cur' },
      { dataField: 'Customer Billed Amount', text: 'Billed Amount', type: 'Cur' },
      { dataField: 'Clearing Reference Number', text: 'Clearing Ref #', type: 'Char' },
      { dataField: 'Ref', text: 'Card Ref #', type: 'Num', isCustomField: true },
      { dataField: 'Created By', text: 'Created By', type: 'Char', isCustomField: true },
      { dataField: 'Cardholder Name', text: 'Cardholder Name', type: 'Char', isCustomField: true },
    ],
    actions: ['Schedule', 'Export CSV'],
    transactions: [],
  };
  componentWillMount() {
    const paymentCardCustomFieldsToColumns = Object.keys(this.props.customFields || {}).map(customFieldId => ({
      dataField: this.props.customFields[customFieldId].name,
      type: 'Char',
      text: this.props.customFields[customFieldId].name,
      isCustomField: true,
    })
    );
    const selectedColumns = this.formatColumns([...this.state.selectedColumns, ...paymentCardCustomFieldsToColumns]);
    const renderedColumns = [...this.state.renderedColumns, ...paymentCardCustomFieldsToColumns];
    this.setState({ selectedColumns, renderedColumns });
  }
  componentDidMount() {}
  componentWillReceiveProps(nextProps) {
    const { status, accountId, organizationId, forms } = nextProps;
    const { selectedColumns } = this.state;


    if (!status.fetching && !this.state.fetched && accountId) {
      const { startDate, endDate } = this.state;
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
        csvData: this.getCsvData(nextProps.transactions, this.state.renderedColumns, this.state.orderBy),
        transactions: this.adaptTransactions(nextProps.transactions).sort((a, b) => { return this.transactionComparator(a, b, this.state.orderBy); }),
      });
    }
  }

  componentWillUnmount() { }

  getCsvData = (transactions, renderedColumns, orderBy) => {
    return Object.values(this.adaptTransactions(transactions))
      .sort((a, b) => { return this.transactionComparator(a, b, orderBy); })
      .reduce((acc, curr) => {
        acc.push(renderedColumns.map(column => column.dataField).map(column => curr[column]));
        return acc;
      }, [renderedColumns.map(column => column.text)]);
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
    const accountName = _try(() => this.props.accounts[this.props.accountId].name, '');
    return transactions.reduce((acc, transaction) => {
      if (!transaction['Card CTS']) return acc;
      const cardIndex = acc.map(t => t['Card CTS']).indexOf((transaction['Card CTS'] || '').trim());
      const accumulation = [...acc];
      if (cardIndex === -1) {
        const accumulationItem = {
          'Card CTS': transaction['Card CTS'].trim(),
          Ref: parseFloat(transaction.Ref),
          'Clearing Reference Number': transaction['Clearing Reference Number'],
          'Card Last 4': transaction['Card Last 4'],
          'Account Name': accountName,
          'Cardholder Name': transaction['Cardholder Name'],
          'Created By': transaction['Created By'],
          'Cleared Amount': parseFloat(transaction['Cleared Amount']),
          'Customer Billed Amount': parseFloat(transaction['Customer Billed Amount']),
        };
        Object.keys(this.props.customFields).forEach((customField) => {
          accumulationItem[customField] = transaction[customField] || '';
        });
        accumulation.push(accumulationItem);
      } else {
        accumulation[cardIndex]['Cleared Amount'] += parseFloat(transaction['Cleared Amount']);
        accumulation[cardIndex]['Customer Billed Amount'] += parseFloat(transaction['Customer Billed Amount']);
      }
      return accumulation;
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
          if (type === 'Cur') return _formatCurrency(cell);
          if (type === 'Date') return _getDateString(cell);
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
    const { status } = this.props;
    const { csvData, transactions } = this.state;

    const renderedColumns = this.formatColumns(this.state.renderedColumns);

    return (
      <ToolkitProvider
        bootstrap4
        keyField="_id"
        data={transactions}
        columns={renderedColumns}
        search
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
                  return (
                    <div style={{ maxHeight: '49px' }} className="text-center">
                      No matching transaction details.
                    </div>);
                }}
              />
            </Fragment>
          )
        }
      </ToolkitProvider>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_reports_spendByCard);

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

// function from stack overflow
const _formatCurrency = (amount) => {
  try {
    const negativeSign = amount < 0 ? '-' : '';
    let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(2), 10).toString();
    let j = (i.length > 3) ? i.length % 3 : 0;

    return `${negativeSign}$${j ? `${i.substr(0, j)},` : ''}${i.substr(j).replace(/(\d{3})(?=\d)/g, '$1,')}.${Math.abs(amount - i).toFixed(2).slice(2)}`;
  } catch (e) {
    console.log(e);
  }
};

// GENERATOR_TYPE='component';
