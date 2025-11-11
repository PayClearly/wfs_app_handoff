import { connect, Component } from 'component';

import Components from 'components';
import { sync, update } from 'store/global/botWorkers';
import {
  AUTOMATION_VM_WORKFLOW_STAGES,
  AUTOMATION_VM_WORKFLOWS,
} from '../../../constants';

const mapStateToProps = (state) => ({
  botWorkers: state.global.botWorkers?.data?.items,
  fetching: state.global.botWorkers?.status?.fetching,
  fetched: state.global.botWorkers?.status?.fetched,
});

const mapDispatchToProps = (dispatch) => ({
  fetchBotWorkers: () => dispatch(sync()),
  updateBotWorker: (id, data) => dispatch(update({ id, ...data })),
});

/* eslint-disable no-nested-ternary */
class componentsTablesBotworkers extends Component {
  state = {
    intervalId: null,
    columns: [
      {
        label: 'Name',
        dataKey: 'name',
        cellRenderer: (_data, _id, worker) => (<span>{worker.name}</span>),
      },
      {
        label: 'IP Address',
        dataKey: 'ip',
        cellRenderer: (_data, _id, worker) => (<span>{worker.ip}</span>),
      },
      {
        label: 'Active',
        dataKey: 'active',
        cellRenderer: (_data, _id, worker) => (<span>{worker.active ? 'Yes' : 'No'}</span>),
      },
      {
        label: 'Status',
        dataKey: 'status',
        cellRenderer: (_data, _id, worker) => (
          <span>
            {worker.stateUpdateInProgress ? 'Updating...' : (worker.status)}
          </span>
        ),
      },
    ],
  };

  componentDidMount() {
    this.props.fetchBotWorkers();
    const intervalId = setInterval(() => {
      this.props.fetchBotWorkers();
    }, 30000);

    this.setState({ intervalId });
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  generateActionContent = (rowData) => {
    const popoverContent = [];

    const {
      _id, stateUpdateInProgress, active, status,
    } = rowData;

    const stopped = status === 'stopped';

    if (!stateUpdateInProgress && !active) {
      popoverContent.push(...[
        {
          title: 'Restart VM',
          onClick: () => this.props.updateBotWorker(_id, {
            stateUpdateInProgress: true,
            state: {
              workflow: AUTOMATION_VM_WORKFLOWS.RESTART_VM,
              stage: AUTOMATION_VM_WORKFLOW_STAGES.WORKFLOW_BEGIN,
            },
          }),
        },
        {
          title: 'Rotate IP',
          onClick: () => this.props.updateBotWorker(_id, {
            stateUpdateInProgress: true,
            state: {
              workflow: AUTOMATION_VM_WORKFLOWS.ROTATE_IP,
              stage: AUTOMATION_VM_WORKFLOW_STAGES.WORKFLOW_BEGIN,
            },
          }),
        },
      ]);
    }

    if (!stateUpdateInProgress && stopped) {
      popoverContent.push({
        title: 'Start VM',
        onClick: () => this.props.updateBotWorker(_id, {
          stateUpdateInProgress: true,
          state: {
            workflow: AUTOMATION_VM_WORKFLOWS.START_VM,
            stage: AUTOMATION_VM_WORKFLOW_STAGES.WORKFLOW_BEGIN,
          },
        }),
      });
    }

    if (!stateUpdateInProgress && !stopped) {
      popoverContent.push({
        title: 'Stop VM',
        onClick: () => this.props.updateBotWorker(_id, {
          stateUpdateInProgress: true,
          state: {
            workflow: AUTOMATION_VM_WORKFLOWS.STOP_VM,
            stage: AUTOMATION_VM_WORKFLOW_STAGES.WORKFLOW_BEGIN,
          },
        }),
      });
    }

    if (rowData.active === false) {
      popoverContent.push({
        title: 'Activate',
        onClick: () => this.props.updateBotWorker(_id, { active: true }),
      });
    }

    if (rowData.active === true) {
      popoverContent.push({
        title: 'Deactivate',
        onClick: () => this.props.updateBotWorker(_id, { active: false }),
      });
    }

    return popoverContent;
  };

  render() {
    const {
      botWorkers,
      fetching,
      fetched,
    } = this.props;

    return (
      <div>
        {
          (fetching || !fetched) ? <Components.spinner /> : (
            <Components.tables.components.collapsibleTable
              tableName="Components.tables.botWorkers"
              tableKey={this.props.tableKey}
              data={{
                items: botWorkers.reduce((acc, worker) => {
                  acc[worker._id] = worker;
                  return acc;
                }, {}),
                count: botWorkers.length,
              }}
              filteredAndSortedItems={botWorkers.map((worker) => worker._id)}
              itemOrder={botWorkers.map((worker) => worker._id)}
              columns={this.state.columns}
              rowRenderer={this.rowRenderer}
              typeForNoDataText="Bot Workers"
              actions
              actionsInFirstColumn
              generateActionContent={this.generateActionContent}
              paginate
              initialRowsPerPage={(this.state.pagination && this.state.pagination.rowsPerPage) || 25}
              keysLength={botWorkers.length}
              loading={fetching}
            />
          )
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(componentsTablesBotworkers);
