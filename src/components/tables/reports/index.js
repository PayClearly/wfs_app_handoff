import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
import Components from 'components';


const mapStateToProps = (state) => {
  return ({
    reports: state.account.reports.data.items,
    reportTemplates: state.account.reportTemplates.data.items,
    fetched: state.account.reports.status.fetched && state.account.reportTemplates.status.fetched,
    reportJobs: state.reportJobs.data.items,
    reportStatus: state.account.reports.status,
    accountId: state.account.data.id,
    organizationId: state.organization.data.id,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    downloadAttachment: (data) => {
      dispatch(Store.account.reports.downloadAttachment(data));
    },
    deleteReport: (organizationId, accountId, reportTemplateId, reportId) => {
      dispatch(Store.account.reports.deleteReport(organizationId, accountId, reportTemplateId, reportId));
    },
    syncJobs: (organizationId, accountId, reportId) => {
      dispatch(Store.reportjobs.sync(organizationId, accountId, reportId));
    },
    openAreYouSureModal: data => dispatch(Store.router.openModal('Components.modals.areyousure', data)),
  });
};

const columns = [
  { label: 'Status', dataKey: 'status', sort: true },
  { label: 'Run Date', dataKey: 'runDate', sort: true, sortKey: 'createdAt', cellRenderer: data => <span>{data.runDate}</span> },
  { label: 'Report Type', dataKey: 'reportType', sort: true },
  { label: 'File Name', dataKey: 'filename', sort: true },
  { label: 'Description', dataKey: 'description', sort: true },
  { label: 'Frequency', dataKey: 'schedule', sort: true },
  { label: 'Range', dataKey: 'range', sort: true },
];

class components_tables_reports extends Component {

  state = {
    searchText: '',
    // searchDate structured this way to be consumed by the daypicker
    searchDate: { value: null },
    rowsToDisplay: 25,
  };


  componentDidUpdate(prevProps) {
    const { reports, accountId, organizationId, syncJobs } = this.props;

    if (Object.keys(reports).length !== Object.keys(prevProps.reports).length) {
      syncJobs(organizationId, accountId, Object.keys(reports));
    }
  }


  getRowData = ({ attachments = [], _createdAt, startDate, endDate, _id, _reportTemplateId, filename, description, schedule }) => {
    const { organizationId, accountId, downloadAttachment, reportJobs, reportTemplates } = this.props;

    const status = reportJobs[_id] ? reportJobs[_id].status : 'n/a';
    const runDate = { runDate: Utils.dates.dateToDay(Date.parse(_createdAt)), createdAt: _createdAt };
    const reportType = _try(() => reportTemplates[_reportTemplateId].type, '');

    const start = startDate.substring(0, 10);
    const end = endDate.substring(0, 10);
    const range = (start === end) ? start : `${start} : ${end}`;

    const typeMap = {
      'application/pdf': 'PDF',
      'text/csv': 'CSV',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
      'text/tab-separated-values': 'TAB',
    };
    const downloadAttachmentActions = attachments.map(attachment => ({
      title: `Download ${typeMap[attachment.contentType] || 'File'}`,
      onClick: () => downloadAttachment(attachment),
      disabled: false,
    }));

    const actionContent = [
      ...downloadAttachmentActions,
      {
        title: 'Delete',
        onClick: this.deleteReportHandler(organizationId, accountId, _reportTemplateId, _id, 'deleted'),
        disabled: this.props.reportStatus.deleting,
      },
    ];

    return {
      status,
      filename,
      description,
      reportType,
      schedule,
      runDate,
      range,
      actionContent,
    };
  }

  handleSearchText = e => this.setState({ searchText: e.target.value });
  handleSearchDate = (action, field, date) => {
    if (action !== 'change') return;
    this.setState({ searchDate: { value: date } });
  };

  handleRowsToDisplayChange = e => this.setState({ rowsToDisplay: e.target.value });


  deleteReportHandler(organizationId, accountId, reportTemplateId, reportId, status) {
    return () => {
      this.props.openAreYouSureModal({
        title: 'Delete Report',
        content: `You are about to set the report status to ${status}`,
        noText: 'No',
        yesText: 'Yes',
        onYes: () => this.props.deleteReport(organizationId, accountId, reportTemplateId, reportId),
      });
    };
  }

  render() {
    const { searchText, searchDate, rowsToDisplay } = this.state;
    const { reports, fetched } = this.props;

    if (!fetched) return null;

    const searchDateString = searchDate.value ? Utils.dates.dateToDay(searchDate.value).toString().substring(0, 10) : null;
    const data = Object.values(reports).filter(report => report.status === 'active').map(report => this.getRowData(report));

    return (
      <Fragment>
        <div className="row">
          <div className="col-md-4 mb-2 mt-2 mt-md-1 mb-md-4">
            <h6>Search</h6>
            <input type="text" className="form-control small" onChange={this.handleSearchText} value={searchText} placeholder="Name or Description" />
          </div>
          <div className="col-md-2 mb-2 mt-2 mt-md-1 mb-md-4">
            <h6>Filter by Run Date</h6>
            <Components.forms.components.daypicker
              form={this.state}
              field="searchDate"
              action={this.handleSearchDate}
              dateRange={{ max: new Date() }}
            />
          </div>
          <div className="col-md-2 offset-md-4 mb-2 mt-2 mt-md-1 mb-md-4">
            <h6>Rows to Display</h6>
            <select className="form-control small" onChange={this.handleRowsToDisplayChange}>
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
          hasActions
          rightActions
          noDataText={(searchText || searchDateString) ? 'No Matching Reports.' : 'No Reports Available.'}
          orderIn="asc"
          sortBy="runDate"
          searchText={searchText}
          secondarySearchText={searchDateString}
          paginatedTable
          rowsPerPage={rowsToDisplay}
        />
      </Fragment>

    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_reports);


