
import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';
import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state) => {
  return ({});
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    downloadAttachment: (data) => {
      dispatch(Store.statements.downloadAttachment(data));
    },
    updateStatement: (organizationId, accountId, revenueShareId, statementId, payload) => {
      dispatch(Store.statements.update(organizationId, accountId, revenueShareId, statementId, payload));
    },
    openAreYouSureModal: data => dispatch(Store.router.openModal('Components.modals.areyousure', data)),
    openPreviewStatementModal: data => dispatch(Store.router.openModal('Components.modals.previewstatement', data)),
    openJobStatusModal: data => dispatch(Store.router.openModal('Components.modals.jobstatus', data)),
    navigateTo: (...data) => dispatch(Store.router.navigateTo(...data)),
  });
};

const mapResourcesToProps = (state, props) => {
  return Object.keys(props.statements || {}).reduce((acc, cur) => {
    acc[cur] = Resources.statementJobs(state, { organizationId: props.organizationId, accountId: props.accountId, id: cur });
    return acc;
  }, {});
};

const columns = [
  { label: 'Status', dataKey: 'status', sort: true },
  { label: 'Created', dataKey: 'date', sort: true },
  { label: 'Total Share', dataKey: 'totalShare', sort: true },
  { label: 'Total Spend', dataKey: 'totalSpend', sort: true },
  { label: 'Number of Payments', dataKey: 'totalCount', sort: true },
  { label: 'Period', dataKey: 'period', sort: true, sortKey: 'sortablePeriod', cellRenderer: data => <span>{data.period}</span> },
  { label: 'File Type', dataKey: 'fileType', sort: true },
];

const mapContentTypeToFileType = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
};

const monthToNumberMap = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

class components_tables_statements extends Component {

  state = {
    filterValue: null,
  }

  componentDidMount() {
    if (this.props.filterOptions) {
      this.setState({ filterValue: 'created' });
    }
  }
  componentWillUnmount() {}

  getRowData = (statement = {}, job = {}) => {
    const [attachment] = statement.attachments || []; // statements only have one attachment
    const { organizationId, accountId } = this.props;
    const { totalCount, totalShare, totalSpend } = statement.revShareDetails || {};
    const { period = '...' } = statement.revShareDetails ? statement.revShareDetails.contract : {};
    const [month, year = 0] = period.split(' ');
    const monthValue = monthToNumberMap[month.toLowerCase()] || 0;
    const yearValue = Number(year) * 100 || 0;
    const sortablePeriod = monthValue + yearValue;
    const contentType = attachment && attachment.contentType || '';
    const fileType = mapContentTypeToFileType[contentType] || 'unrecognized file type';
    const status = attachment ? statement.status : job.status || 'unknown';

    const date = _dateToDay(new Date(statement._createdAt || job.createdAt));

    const actionContent = [];

    if (job.status === 'error') {
      actionContent.push({
        title: 'Retry',
        onClick: () => this.props.navigateTo('jobs', { id: job._id, type: 'statements', status: job.status, date }),
        disabled: false,
      });
    }

    if (job.status === 'queued' || job.status === 'error') {
      actionContent.push({
        title: 'Cancel',
        onClick: () => {},
        disabled: false,
      });
    }

    // statement entity has been set but attachment might not be ready
    if (job.status === 'processed' || attachment) {
      actionContent.push(
        {
          title: 'Mark for Approval',
          onClick: this.statementUpdateHandler(organizationId, accountId, statement._revenueShareId, statement._id, 'pending'),
          disabled: false,
        }, {
          title: 'Download',
          onClick: () => this.props.downloadAttachment(attachment),
          disabled: false,
        }, {
          title: 'Preview',
          onClick: () => this.props.openPreviewStatementModal({ attachment }),
          disabled: fileType !== 'pdf',
        }, {
          title: 'Delete',
          onClick: this.statementUpdateHandler(organizationId, accountId, statement._revenueShareId, statement._id, 'deleted'),
          disabled: false,
        }
      );
    }

    if (statement.status === 'pending') {
      actionContent.push(
        {
          title: 'Approve',
          onClick: this.statementUpdateHandler(organizationId, accountId, statement._revenueShareId, statement._id, 'approved'),
          disabled: false,
        },
        {
          title: 'Reject',
          onClick: this.statementUpdateHandler(organizationId, accountId, statement._revenueShareId, statement._id, 'rejected'),
          disabled: false,
        }
      );
    }

    return {
      status,
      date,
      period: { period, sortablePeriod },
      totalCount: totalCount || '...',
      totalShare: totalShare || '...',
      totalSpend: totalSpend || '...',
      attachment,
      actionContent,
      fileType,
    };
  };

  statementUpdateHandler(organizationId, accountId, _id, statementId, status) {
    return () => {
      this.props.openAreYouSureModal({
        title: 'Update Statement',
        content: `You are about to set the statements status to ${status}`,
        noText: 'No',
        yesText: 'Yes',
        onYes: () => this.props.updateStatement(organizationId, accountId, _id, statementId, { status }),
      });
    };
  }

  handleStatusFilterChange = (e) => {
    const filterValue = e.target.value === 'all' ? null : e.target.value;
    this.setState({ filterValue });
  }

  render() {
    const { filterValue } = this.state;
    const { statements = {} } = this.props;

    const data = Object.keys(statements).map(key => this.getRowData(statements[key], this.props[key] || {}));

    return (
      <Fragment>
        {this.props.filterOptions ? 
          <Fragment>
            <h6>Filter Statements by Status</h6>
            <select className="form-control small col-md-4" onChange={this.handleStatusFilterChange}>
              <option value="created">Created</option>
              <option value="approved">Approved</option>
              <option value="queued">Queued</option>
              <option value="processing">Processing</option>
              <option value="processed">Processed</option>
              <option value="pending">Pending</option>
              <option value="error">Error</option>
              <option value="cancelled">Cancelled</option>
              <option value="all">All</option>
            </select> 
          </Fragment>
          : null
        }
        <Components.tables.components.collapsabletable
          columns={columns}
          data={data}
          filter={{ filterBy: 'status', filterValue }}
          doNotExpand
          hasActions
          rightActions
          noDataText="No Statements Available"
          orderIn="desc"
          sortBy="period"
          defaultSortKey="sortablePeriod"
        />
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_tables_statements);

// Internal Helper Functions ...
function _dateToDay(at) {
  const date = new Date(at);

  const dd = _formatLessThanTen(date.getDate());
  const mm = _formatLessThanTen(date.getMonth() + 1);
  const yyyy = date.getFullYear();

  return `${mm}-${dd}-${yyyy}`;
}

function _formatLessThanTen(time) {
  return time < 10 ? `0${time}` : time;
}

