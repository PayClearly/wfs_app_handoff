import { connect, Component } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  formState: _try(() => state.forms['Components.forms.jobsearch'].default._values, {}),
  jobs: _try(() => Selectors.jobs(state), { jobs: [], fetched: false }),
  policies: Selectors.entity('jobs_*_*')(state),
});

const mapDispatchToProps = (dispatch) => ({
  retryJob: (jobType, jobId) => {
    dispatch(Store.jobs.retry(jobType, jobId));
  },
  cancelJob: (jobType, jobId) => {
    dispatch(Store.jobs.cancel(jobType, jobId));
  },
  retryAllJobs: (jobs) => {
    dispatch(Store.jobs.retryAllJobs(jobs));
  },
});

// eslint-disable-next-line camelcase
class components_routes_jobs extends Component {
  handleRetryAll = () => {
    const jobs = this.props.jobs.jobs
      .filter((job) => job.status === this.props.formState.statusFilter)
      .map((job) => ({ id: job._id, type: job.type }));
    this.props.retryAllJobs(jobs);
  };

  handleRetry = (row) => {
    const { _id, type } = row;
    this.props.retryJob(type, _id);
  };

  handleCancel = (row) => {
    const { _id, type } = row;
    this.props.cancelJob(type, _id);
  };

  //   // must pass down null as the 'all' option to the table to show all options
  // };

  render() {
    const columns = [
      { label: '#', dataKey: 'index' },
      {
        label: 'Type', dataKey: 'typeDisplay', sort: true, default: 'Unknown',
      },
      { label: 'Id', dataKey: '_id', sort: true },
      { label: 'Status', dataKey: 'status', sort: true },
      {
        label: 'Created',
        dataKey: 'createdAt',
        sort: true,
        cellRenderer: (data) => (
          <span>
            {new Date(data).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric' })}
          </span>
        ),
      },
    ];

    const rowRenderer = (row) => {

      const actionButtonOptions = [{
        title: 'Retry Job',
        onClick: () => {
          this.handleRetry(row);
        },
      }, {
        title: 'Cancel Job',
        onClick: () => {
          this.handleCancel(row);
        },
      }];

      return row.status === 'error'
        ? <Components.cards.joberror data={row} actionButtonOptions={actionButtonOptions} />
        : <Components.cards.jobprocessed data={row} actionButtonOptions={actionButtonOptions} />;
    };

    const data = this.props.jobs.jobs || [];
    const { policies } = this.props;

    if (!policies.canUpdate) {
      return null;
    }

    return (
      <div className="components_routes_jobs pt-4">
        <Components.forms.jobsearch retryAll={this.handleRetryAll} />
        {this.props.jobs.fetched
          ? (
            <Components.tables.components.collapsabletable
              columns={columns}
              data={data}
              filter={{ filterBy: 'type', filterValue: this.props.formState.typeFilter }}
              secondaryFilter={{ filterBy: 'status', filterValue: this.props.formState.statusFilter }}
              noDataText="No Job Data Available"
              orderIn="asc"
              paginatedTable
              rowRenderer={rowRenderer}
              rowsPerPage={10}
              searchText={this.props.formState.search}
              sortBy="createdAt"
            />)
          : <Components.spinner />}
      </div>

    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_jobs);
