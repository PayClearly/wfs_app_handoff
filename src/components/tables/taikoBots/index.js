import { connect, Component } from 'component';

import Store from 'store';
import Components from 'components';
import { FormatRef, FormatAmount } from './utils';

const BADGE_STYLES = {
  paused: 'badge rounded-pill bg-secondary',
  queued: 'badge rounded-pill bg-primary',
  failed: 'badge rounded-pill bg-danger',
  running: 'badge rounded-pill bg-warning',
  submitted: 'bade rounded-pill bg-danger',
  success: 'badge rounded-pill bg-success',
  retired: 'badge rounded-pill bg-dark',
};

const mapStateToProps = (state) => ({
  initialized: _resolve(state.account, 'taikoBots.status.initialized'),
  initializing: _resolve(state.account, 'taikoBots.status.initializing'),
  initializingKeys: _resolve(state.account, 'taikoBotKeys.status.initializing'),
  replacing: _resolve(state.account, 'taikoBots.status.replacing'),
  taikoBots: _resolve(state.account, 'taikoBots.data.items'),
  pagination: _try(() => state.tables['Components.tables.taikoBots'].taikoBots.pagination),
  groups: state.global.groups.data.items,
  taikoBotKeys: _resolve(state.account, 'taikoBotKeys.data.items'),
  organizations: state.organizations.data.items,
  forms: state.forms,
  initializingError: _resolve(state.account, 'taikoBotKeys.status.initializingError'),
});

const mapDispatchToProps = (dispatch) => ({
  openAreYouSureModal: (data) => { dispatch(Store.router.openModal('Components.modals.areyousure', data)); },
  downloadAttachment: (attachmentMetadata) => { dispatch(Store.global.downloadAttachment(attachmentMetadata)); },
  updateTaikoBotStatus: (id, status) => { dispatch(Store.account.taikoBots.updateTaikoBotStatus(id, status)); },
  fetchTaikoBots: (ids) => { dispatch(Store.account.taikoBots.fetchTaikoBots(ids)); },
  fetchTaikoBotKeys: ({ organizationId, status }) => {
    dispatch(Store.account.taikoBotKeys.sync({ organizationId, status }));
  },
  clearTaikoBotListeners: () => { dispatch(Store.account.taikoBots.clear()); },
  updateTaikoBotsByIds: (updators) => { dispatch(Store.account.taikoBots.updateTaikoBotsByIds(updators)); },
});

class componentsTablesTaikoBots extends Component {
  state = {
    columns: [
      {
        label: 'Status',
        dataKey: 'status',
        sortable: true,
        cellRenderer: (data, id, bot) => (<span className={BADGE_STYLES[bot.status]}>{bot.status}</span>),
      },
      {
        label: 'Ref #',
        dataKey: 'refNumber',
        sortable: true,
        cellRenderer: (data, id, bot) => (<div>{FormatRef(bot.refNo)}</div>),
      },
      {
        label: 'Amount',
        dataKey: 'amount',
        sortable: true,
        default: 'Unknown',
        cellRenderer: (data, id, bot) => FormatAmount(bot.amount || 1.00),
      },
      {
        label: 'Group',
        dataKey: 'groupName',
        sortable: true,
        cellRenderer: (data, id, bot) => <div>{this.props.groups[bot.groupId].name}</div>,
      },
      {
        label: 'Organization',
        dataKey: 'organizationName',
        sortable: true,
        cellRenderer: (data, id, bot) => <div>{this.props.organizations[bot.organizationId].name}</div>,
      },
    ],
    form: {},
  };

  componentWillReceiveProps(nextProps) {
    const form = nextProps.forms['Components.forms.botsFilter']
      && (nextProps.forms['Components.forms.botsFilter'].default || {});

    this.setState({
      form,
    });
  }

  shouldComponentUpdate(nextProps) {
    return !(this.props.replacing && nextProps.replacing);
  }

  componentDidUpdate(prevProps = {}) {
    const {
      pagination,
      taikoBotKeys,
      replacing,
      fetchTaikoBots,
      initializingKeys,
    } = this.props;

    const currentPage = (pagination && pagination.currentPage) || 0;
    const prevPage = prevProps.pagination && prevProps.pagination.currentPage;

    const rowsPerPage = (pagination && pagination.rowsPerPage) || 25;
    const prevRowsPerPage = (prevProps.pagination && prevProps.pagination.rowsPerPage);

    const botKeysExist = taikoBotKeys && taikoBotKeys.length;
    const prevBotKeysExist = prevProps.taikoBotKeys && prevProps.taikoBotKeys.length;

    const isReplacingBots = replacing;
    const isInitializingKeys = initializingKeys;

    const keysHaveChanged = botKeysExist && prevBotKeysExist && !(
      taikoBotKeys.every((key) => prevProps.taikoBotKeys.includes(key))
      && prevProps.taikoBotKeys.every((key) => taikoBotKeys.includes(key))
    );

    const pageHasChanged = prevPage !== currentPage || prevRowsPerPage !== rowsPerPage;

    if (botKeysExist && (keysHaveChanged || pageHasChanged) && !isReplacingBots && !isInitializingKeys) {
      const itemsToRender = taikoBotKeys.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);
      fetchTaikoBots(itemsToRender);
    }
  }

  componentWillUnmount() {
    this.props.clearTaikoBotListeners();
  }

  handleSubmitFilters = () => {
    const { form } = this.state;
    const { status, organizationId } = form._values;
    this.props.fetchTaikoBotKeys({ organizationId, status });
  };

  _generateActionContent = (rowData) => {
    const popoverContent = [];

    const { id } = rowData;

    if (rowData.status === 'failed' || rowData.status === 'paused') {
      popoverContent.push({
        title: 'Retire This Bot',
        onClick: () => {
          this.props.openAreYouSureModal({
            title: 'Permanently retire bot',
            content: 'You are about to retire this bot. '
              + 'It will be archived and the payment will need to be completed manually',
            noText: 'No',
            yesText: 'Yes',
            onYes: () => this.props.updateTaikoBotStatus({ id, status: 'retired' }),
          });
        },
      });
    }
    if (rowData.status === 'failed') {
      popoverContent.push({
        title: 'Retry This Bot',
        onClick: () => this.props.updateTaikoBotStatus({ id, status: 'queued' }),
        disabled: this.props.taikoBots[id].retryBlockedUntil > Date.now(),
      });
    }
    if (rowData.status === 'paused') {
      popoverContent.push({
        title: 'Start This Bot',
        onClick: () => this.props.updateTaikoBotStatus({ id, status: 'queued' }),
        disabled: this.props.taikoBots[id].retryBlockedUntil > Date.now(),
      });
    }
    if (rowData.status === 'queued') {
      popoverContent.push({
        title: 'Pause This Bot',
        onClick: () => this.props.updateTaikoBotStatus({ id, status: 'paused' }),
      });
    }

    if (rowData.status === 'submitted') {
      popoverContent.push({
        title: 'Unlock this bot',
        onClick: () => this.props.openAreYouSureModal({
          title: 'Unlock bot and change status to paused',
          content: 'WARNING: This bot may have submitted a payment.\n'
            + 'This action can potentially cause a duplicate payment to be submitted.\n'
            + 'Please verify this bot has not successfully made a payment before confirming.\n'
            + 'Are you sure you want to unlock this bot?',
          noText: 'No',
          yesText: 'Yes',
          onYes: () => this.props.updateTaikoBotStatus({ id, status: 'paused' }),
        }),
      });
    }

    return popoverContent;
  };

  startAllBots = () => {
    const bots = Object.values(this.props.taikoBots)
      .filter((bot) => bot.status === 'paused' || bot.status === 'failed');
    const updators = bots.map((bot) => ({ to: { status: 'queued' }, id: bot.id }));
    return this.props.updateTaikoBotsByIds(updators);
  };

  pauseAllQueuedBots = () => {
    const queuedBots = Object.values(this.props.taikoBots).filter((bot) => bot.status === 'queued');
    const updators = queuedBots.map((bot) => ({ to: { status: 'paused' }, id: bot.id }));
    return this.props.updateTaikoBotsByIds(updators);
  };

  retireAllBots = () => {
    const filterCallback = (bot) => bot.status !== 'running' && bot.status !== 'retired';
    const bots = Object.values(this.props.taikoBots).filter(filterCallback);
    const updators = bots.map((bot) => ({ to: { status: 'retired' }, id: bot.id }));

    return updators.length ? this.props.updateTaikoBotsByIds(updators) : null;
  };

  rowRenderer = (rowId, rowData) => ( // eslint-disable-line
    <div className="py-2">
      <div className="card mb-2">
        <h4 className="card-title mt-3 ms-3">CSR View</h4>
        <div className="px-3">
          <Components.overviews.taikoBot id={rowId} bot={rowData} />
        </div>
      </div>
    </div>
  );

  render() {
    const {
      taikoBots,
      taikoBotKeys = [],
      initializing,
      initializingKeys,
      replacing,
      initialTableStateOverride,
      clearTaikoBotListeners,
    } = this.props;

    const { form } = this.state;

    const filteredAndSortedItems = taikoBotKeys || [];

    const filterStatus = form._values && form._values.status;
    const startAllDisabled = !(filterStatus === 'paused' || filterStatus === 'failed');
    const pauseAllDisabled = !(filterStatus === 'queued');

    return (
      <div>
        <div className="d-flex flex-column justify-content-left align-items-left">
          <div>
            <h3 className="text-muted mb-2 mb-md-2">Controls</h3>
            <div style={{ gap: '5px', display: 'flex' }}>
              <Components.button
                buttonText={filterStatus === 'failed' ? 'Retry All' : 'Start All'}
                onClick={() => this.startAllBots()}
                ariaLabel="Start all bots on screen"
                disabled={initializing || replacing || initializingKeys || startAllDisabled}
              />
              <Components.button
                buttonText="Pause All"
                onClick={() => this.pauseAllQueuedBots()}
                ariaLabel="Pause all queued bots"
                disabled={initializing || replacing || initializingKeys || pauseAllDisabled}
              />
              <Components.button
                buttonText="Retire All"
                onClick={() => this.retireAllBots()}
                ariaLabel="Retire all bots on screen"
                disabled={initializing || replacing || initializingKeys}
              />
            </div>
          </div>
          <div className="mt-3">
            {
              this.props.initializingError
              && (
                <div className="alert alert-danger" role="alert">
                  <h4 className="alert-heading">Something Went Wrong</h4>
                  Error: {this.props.initializingError}
                </div>
              )
            }
            <h3 className="text-muted mb-2 mb-md-0">Search Filters</h3>
            <Components.forms.botsFilter
              initializing={initializing}
              replacing={replacing}
              initializingKeys={initializingKeys}
              onSubmit={this.handleSubmitFilters}
            />
          </div>
        </div>
        {
          initializingKeys || initializingKeys
            ? <Components.spinner />
            : (
              <Components.tables.components.collapsibleTable
                tableName="Components.tables.taikoBots"
                tableKey={this.props.tableKey}
                initialTableStateOverride={initialTableStateOverride}
                defaultTableState={{
                  sort: {
                    sortKey: 'refNumber',
                    orderIn: 'desc',
                  },
                }}
                data={{
                  items: taikoBots,
                  count: taikoBotKeys.length,
                }}
                itemOrder={filteredAndSortedItems}
                columns={this.state.columns}
                rowRenderer={this.rowRenderer}
                onClearItems={clearTaikoBotListeners}
                typeForNoDataText="Taiko Bots"
                actions
                actionsInFirstColumn
                generateActionContent={this._generateActionContent}
                paginate
                initialRowsPerPage={(this.state.pagination && this.state.pagination.rowsPerPage) || 25}
                keysLength={taikoBotKeys.length}
                loading={initializing || replacing}
              />
            )
        }
      </div>
    );
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(componentsTablesTaikoBots);

