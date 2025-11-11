import { connect, Component } from 'component';
import Store from 'store';
import Components from 'components';
import {
  formatCurrency,
  getDateString,
  sortNumbers,
  sortDates,
  sortCaret,
  getStartDate,
  getEndDate,
} from 'components/reports/utils';

import { CSVLink } from 'react-csv';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import {
 Dropdown, DropdownToggle, DropdownMenu, DropdownItem, 
} from 'reactstrap';
import paginationFactory from 'react-bootstrap-table2-paginator';
import overlayFactory from 'react-bootstrap-table2-overlay';
import BootstrapTable from 'react-bootstrap-table-next';
import { PCTR_CARD_FIELDS, PCTR_CHECK_FIELDS, PCTR_ACH_FIELDS } from '../constants';

const REPORT_TYPES = {
  pctrAch: PCTR_ACH_FIELDS,
  pctrCheck: PCTR_CHECK_FIELDS,
  pctrCard: PCTR_CARD_FIELDS,
};

const mapStateToProps = (state) => ({
  status: state.account.pctrReport.status,
  organizationId: state.organization.data.id,
  accountId: state.account.data.id,
  accounts: state.accounts.data.items,
  forms: state.forms,
  transactions: state.account.pctrReport.data.items,
  paymentCustomFields: state.account.paymentCustomFields.data.item,
});

const mapDispatchToProps = (dispatch, props) => (
  {
    fetchTransactions: (startDate, endDate) => (
      dispatch(Store.account.pctrReport.fetch(startDate, endDate, props.pctrType))
    ),
    openReportScheduleModal: (columns, renderColumns, orderBy) => (
      dispatch(Store.router.openModal(
        'Components.modals.reportschedule',
        {
          type: props.pctrType,
          columns,
          renderColumns,
          orderBy,
        }
      ))
    ),
    clearTransactions: () => dispatch(Store.pctrAchReport.clear()),
  }
);

class componentsReportsPctrAch extends Component {
  state = {
    dropDownIsOpen: false,
    fetched: false,
    startDate: getStartDate(),
    endDate: getEndDate(),
    orderBy: {
      dataField: '_ref',
      direction: 'desc',
    },
    selectedColumns: [
      ...REPORT_TYPES[this.props.pctrType],
      ...Object.keys(this.props.paymentCustomFields || {}).map((key) => (
        { 
          dataField: key,
          text: key,
          type: 'Char',
          isCustomField: true, 
        }
      )),
      ],
    renderedColumns: [
      ...REPORT_TYPES[this.props.pctrType],
      ...Object.keys(this.props.paymentCustomFields || {}).map((key) => (
        { 
          dataField: key,
          text: key,
          type: 'Char',
          isCustomField: true, 
        }
      )),
      ],
    initialFieldNames: [
      ...REPORT_TYPES[this.props.pctrType].map((field) => field.text),
      ...Object.keys(this.props.paymentCustomFields || {}),
    ],
    actions: ['Schedule', 'Export CSV'],
    transactions: [],
    csvData: [],
  };

  componentWillReceiveProps(nextProps) {
    const {
      status,
      accountId,
      organizationId,
      forms,
      pctrType,
    } = nextProps;
  
    const notFetchedYet = !status.fetching && !this.state.fetched;
    const hasContext = organizationId !== null && accountId !== null;
    const contextHasChanged = accountId !== this.props.accountId || organizationId !== this.props.organizationId;
    let fetchedInitial = false;

    const datePickerFormExists = forms['Components.forms.reportsearch']
      && forms['Components.forms.reportsearch'].default
      && this.props.forms['Components.forms.reportsearch']
      && this.props.forms['Components.forms.reportsearch'].default;
    
    if (hasContext && (notFetchedYet || contextHasChanged)) {
      fetchedInitial = true;
      this.props.fetchTransactions(this.state.startDate.slice(0, 10), this.state.endDate.slice(0, 10), pctrType);
      this.setState({ fetched: true });
    }

    if (datePickerFormExists && !fetchedInitial) {
      const previousStartDate = this.props.forms['Components.forms.reportsearch'].default.startDate;
      const previousEndDate = this.props.forms['Components.forms.reportsearch'].default.endDate;
      const nextStartDate = nextProps.forms['Components.forms.reportsearch'].default.startDate;
      const nextEndDate = nextProps.forms['Components.forms.reportsearch'].default.endDate;

      const startDateChanged = previousStartDate.value.toISOString()
        !== nextStartDate.value.toISOString()
        && !nextStartDate.error;

      const endDateChanged = previousEndDate.value.toISOString()
        !== nextEndDate.value.toISOString()
        && !nextEndDate.error;

      if (startDateChanged || endDateChanged) {
        this.props.fetchTransactions(
          nextStartDate.value.toISOString().slice(0, 10),
          nextEndDate.value.toISOString().slice(0, 10),
          pctrType
        );

        this.setState({ startDate: nextStartDate.value.toISOString(), endDate: nextEndDate.value.toISOString() });
      }
    }

    if (nextProps.transactions) {
      this.setState({
        csvData: this.getCsvData(
          nextProps.transactions,
          nextProps.selectedColumns || this.state.selectedColumns,
          this.state.orderBy
        ),
      });
    }
  }

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
    }, [(selectedColumns || []).map((column) => column.text)]);

  handleScheduleReport = () => {
    const { selectedColumns, renderedColumns, orderBy } = this.state;
    this.props.openReportScheduleModal(selectedColumns, renderedColumns, orderBy);
  };

  toggle = () => {
    this.setState((prevState) => ({ dropDownIsOpen: !prevState.dropDownIsOpen }));
  };

  formatColumns = (fields = []) => fields.map(
    (
      {
        dataField, 
        text, 
        type, 
        isCustomField, 
      }
    ) => {
      const data = {
        dataField,
        text,
        type,
        isCustomField: isCustomField || false,
        sort: true,
        sortCaret, // eslint-disable-line
        formatter: (cell) => {
          if (cell === null || cell === undefined) { return ''; }
          if (type === 'Cur') { return formatCurrency(cell); }
          if (type === 'Date') { return getDateString(cell); }
          return cell;
        },
        onSort: this.onSort,
        style: (_cell, _row, _rowIndex, colIndex) => {
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
      if (type === 'Num' || type === 'Cur') { data.sortFunc = sortNumbers; }
      if (type === 'Date') { data.sortFunc = sortDates; }
      return data;
    }
  );

  render() {
    const { transactions, status } = this.props;
    const { csvData } = this.state;

    const renderedColumns = this.formatColumns(this.state.renderedColumns);

    return (
      <ToolkitProvider
        bootstrap4
        keyField="_ref"
        data={transactions}
        columns={renderedColumns}
      >
        {
        (props) => (
          <>
            <div className={'row'}>
              <div className={'col-11'}>
                <Components.forms.reportsearch
                  {...props.searchProps} // eslint-disable-line
                />
              </div>
              <div className={'col-1 text-center'}>
                <Dropdown isOpen={this.state.dropDownIsOpen} toggle={this.toggle}>
                  <DropdownToggle caret className={'btn btn-outline-primary'}>
                    {'Actions'}
                  </DropdownToggle>
                  <DropdownMenu right>
                    {this.state.actions.map((action) => {
                    if (action === 'Actions') { return false; }
                    if (action === 'Schedule') {
                      return (
                        <DropdownItem onClick={() => this.handleScheduleReport()}>
                          <span className="mdi mdi-calendar-clock">&nbsp;&nbsp;{action}</span>
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
                    return (
                      <DropdownItem onClick={() => null}>
                        {action}
                      </DropdownItem>
                    );
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
              if (!status.fetched) { return <Components.spinner style={{ minHeight: '300px' }} />; }
              return (
                <div style={{ maxHeight: '49px' }} className="text-center">
                  No matching transaction details.
                </div>
              );
              }}
            />
          </>
        )
      }
      </ToolkitProvider>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(componentsReportsPctrAch);
