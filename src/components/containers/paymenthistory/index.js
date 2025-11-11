import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';

// Third Party Imports ...


import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  accountStatus: state.accounts.status,
  paymentStatuses: state.account.paymentStatuses.data.items,
  paymentStatusesStatus: state.account.paymentStatuses.status,
  user: state.user,
  routeParams: state.router.route.params,
  canAudit: Selectors.privileges(state).canAudit,
  pendingRefunds: state.account.accountBalances.data.item.pendingRefunds,
  organization: state.organization.data,
  featureFlags: Selectors.featureFlags(state),
  batchStatus: state.account.batchPayments.status,
  achIntegrationDetails: state.account.achIntegration.data.details,
  checksIntegrationDetails: state.account.checksIntegration.data.details,
});

const mapDispatchToProps = (dispatch, props) => ({
  openPaymentPresendModal: (id) => { dispatch(Store.router.openModal('Components.modals.paymentsend.modal', { id })); },
  openAreYouSureModal: (data) => { dispatch(Store.router.openModal('Components.modals.areyousure', data)); },
  openSchedulerModal: (ids, payAt) => dispatch(Store.router.openModal('Components.modals.scheduler', { ids, payAt })),
  openPaymentIssuesModal: () => dispatch(Store.router.openModal('Components.modals.paymentIssues', {})),
  updateBatchViewPreferences: (preference) => {
    dispatch(Store.user.updatePreferences({
      viewHistoryByBatch: preference || null,
    }));
  },
  markBatchAsCancelled: (ids, params) => { dispatch(Store.account.updatePaymentPipelines(ids, 'cancelPayments', params)); },
  addFilter: (tableName, tableKey, filterData) => {
    dispatch(Store.tables.addFilter(tableName, tableKey, filterData));
  },
  removeQueryParams: (params = []) => {
    dispatch(Store.router.removeQueryParams(params));
  },
});

class components_containers_paymenthistory extends Component {
  state = {
    mouseDown: false,
    viewBatches: false,
    searchText: '',
    filterBy: 'statusForFilterActive',
    filterValue: 'active',
    secondaryFilterBy: 'paymentDeliveryMethod',
    secondaryFilterValue: '',
    rowsToDisplay: 25,
    tableKey: 'historyRoute',
    newPaymentId: '',
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(nextProps = {}) {
    if ((_try(() => nextProps.user.preferences.data.item)) && this.state.viewBatches !== _try(() => nextProps.user.preferences.data.item.viewHistoryByBatch)) {
      this.setState({ viewBatches: Boolean(nextProps.user.preferences.data.item.viewHistoryByBatch) });
    }
    if (_try(() => this.props.routeParams.npi) && !this.state.newPaymentId) {
      this.setState({ newPaymentId: this.props.routeParams.npi });
    }
  }

  componentWillUnmount() {
    if (_try(() => this.props.routeParams.npi)) {
      this.props.removeQueryParams(['npi']);
    }
  }

  onActionClick(title, id) {
    this.props.openPaymentPresendModal(id);
  }

  cancelBatch = (paymentsForBatch) => {
    const paymentsThatCanBeCancelled = paymentsForBatch.filter((id) => Utils.paymentCanBeCancelled(this.props.paymentStatuses[id], {
      achIntegrationProvider: this.props.achIntegrationDetails.provider,
      checksIntegrationProvider: this.props.checksIntegrationDetails.provider,
    }));
    this.props.openAreYouSureModal({
      title: 'Cancel Entire Batch',
      content: paymentsThatCanBeCancelled.length === paymentsForBatch.length
        ? 'You are about to cancel all payments in this batch.'
        : 'This batch contains checks which have already been processed and cannot be cancelled. All other payments in this batch will be cancelled.',
      noText: 'No',
      yesText: 'Yes',
      onYes: (params) => this.props.markBatchAsCancelled(paymentsThatCanBeCancelled, {}),
    });
  };

  switchView = () => {
    this.setState((prevState) => ({ viewBatches: !prevState.viewBatches }), () => { this.props.updateBatchViewPreferences(this.state.viewBatches); });
  };

  render() {
    // *TO DO* show invalid permission message
    if (!this.props.canAudit) { return null; }
    if (!_try(() => this.props.accountStatus.fetched)) { return <Components.spinner />; }

    const newPaymentId = _try(() => this.state.newPaymentId);

    return (
      <Fragment>
        <div className="row justify-content-between align-items-center mb-3">
          <div className="col-auto">
            <h2 className="card-title m-0">{!this.state.viewBatches ? 'Payments' : 'Payment Batches'}</h2>
          </div>
          <div className="col-md-auto col-12">
            {!this.state.viewBatches && this.state.pendingRefunds
              && <a
                className={`${this.props.pendingRefunds.paymentsWithIssuesIds ? 'text-danger' : 'text'} me-4`}
                role="button"
                tabIndex="-1"
                onClick={() => this.props.openPaymentIssuesModal()}
                style={{ cursor: 'pointer' }}
              >
                <i className="mdi mdi-alert-circle-outline" /> {`View Payment Issues${this.props.pendingRefunds.paymentsWithIssuesIds ? ` (${this.props.pendingRefunds.paymentsWithIssuesIds.length} Unresolved)` : ''}`}
              </a>}
            <span
              className={`payment-view-button ${this.state.viewBatches ? 'unselected' : 'selected'}`}
              onClick={() => {
                if (this.state.viewBatches) {
                  this.switchView();
                }
              }}
              role="button"
              tabIndex={0}
            >
              Payment <i className="mdi mdi-hexagon" />
            </span>
            &nbsp;|&nbsp;
            <span
              className={`payment-view-button ${!this.state.viewBatches ? 'unselected' : 'selected'}`}
              onClick={() => {
                if (!this.state.viewBatches) {
                  this.switchView();
                }
              }}
              role="button"
              tabIndex={0}
            >
              Batch <i className="mdi mdi-hexagon-multiple" />
            </span>
          </div>
        </div>
        {!this.state.viewBatches && this.props.paymentStatusesStatus.fetched
          && <Fragment>
            <Components.tables.components.multiFilter
              tableName="Components.tables.paymenthistory"
              tableKey={this.state.tableKey}
              filterConfig={_getPaymentHistoryFilterConfig({}, true, this.props.organization.id, this.props.featureFlags)}
            />
            <Components.tables.paymenthistory
              tableKey={this.state.tableKey}
              onActionClick={(title, id) => { this.onActionClick(title, id); }}
              newPaymentId={newPaymentId}
            />
          </Fragment>}
        {!this.state.viewBatches && !this.props.paymentStatusesStatus.fetched
          && <Components.spinner />}
        {this.state.viewBatches && this.props.batchStatus.fetched
          && <Fragment>
            <Components.tables.components.multiFilter
              tableName="Components.tables.batchhistory"
              tableKey={this.state.tableKey}
              filterConfig={filterConfig.batch.multiFilter}
            />
            <Components.tables.batchhistory
              tableKey={this.state.tableKey}
              onActionClick={(title, id) => { this.onActionClick(title, id); }}
              cancelBatch={this.cancelBatch}
              editBatch={this.props.openSchedulerModal}
            />
          </Fragment>}
        {this.state.viewBatches && !this.props.batchStatus.fetched
          && <Components.spinner />}
      </Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_containers_paymenthistory);

// Internal Helper Functions ...
const _getPaymentHistoryFilterConfig = (customFields, multiFilter, organizationId, featureFlags = {}) => {
  const additionalFilters = {};

  if (featureFlags.clients) {
    additionalFilters.clientDisplay = {
      key: 'clientDisplay',
      type: 'string',
      display: 'Client',
    };
  }

  const filterConfigToCopy = multiFilter ? filterConfig.payment.multiFilter : filterConfig.payment.originalFilter;

  return { ...filterConfigToCopy, ...additionalFilters };
};

const filterConfig = {
  payment: {
    multiFilter: {
      vendorName: {
        key: 'vendorName',
        type: 'string',
        display: 'Vendor',
      },
      createdTimeAfter: {
        key: 'createdTime',
        type: 'date',
        display: 'Date From',
        condition: 'isAfter',
      },
      createdTimeBefore: {
        key: 'createdTime',
        type: 'date',
        display: 'Date To',
        condition: 'isBefore',
      },
      status: {
        key: 'status',
        type: 'option',
        display: 'Status',
        options: {
          Scheduled: { display: 'Scheduled' },
          'Needs Approval': { display: 'Needs Approval' },
          'Pending...': { display: 'Pending' },
          'Processing...': { display: 'Processing' },
          'Verifying...': { display: 'Verifying' },
          'Funding...': { display: 'Funding' },
          'Tracking...': { display: 'Tracking' },
          Complete: { display: 'Completed' },
          Cancelled: { display: 'Cancelled' },
        },
      },
      hasIssues: {
        key: 'hasIssues',
        type: 'bool',
        display: 'Issue',
      },
      method: {
        key: 'method',
        type: 'option',
        display: 'Method',
        options: {
          vCard: { display: 'Card' },
          ACH: { display: 'ACH' },
          check: { display: 'Check' },
        },
      },
      amount: {
        key: 'amount',
        type: 'number',
        display: 'Amount',
      },
      details: {
        key: 'details',
        type: 'string',
        display: 'Details',
      },
      _ref: {
        key: '_ref',
        type: 'number',
        display: 'Ref #',
      },
      manual: {
        key: 'isManual',
        type: 'bool',
        display: 'Manual Payments',
      },
      last4s: {
        key: 'cardLast4s',
        type: 'string',
        display: 'Card Last 4',
      },
    },
    originalFilter: {
      isActive: {
        key: 'isActive',
        type: 'bool',
        display: 'Active',
      },
      status: {
        key: 'status',
        type: 'option',
        display: 'Status',
        options: {
          Scheduled: { display: 'Scheduled' },
          'Needs Approval': { display: 'Needs Approval' },
          'Pending...': { display: 'Pending' },
          'Processing...': { display: 'Processing' },
          'Verifying...': { display: 'Verifying' },
          'Funding...': { display: 'Funding' },
          'Tracking...': { display: 'Tracking' },
          Complete: { display: 'Completed' },
          Cancelled: { display: 'Cancelled' },
        },
      },
      createdTime: {
        key: 'createdTime',
        type: 'date',
        display: 'Date',
      },
      vendorName: {
        key: 'vendorName',
        type: 'string',
        display: 'Vendor',
      },
      amount: {
        key: 'amount',
        type: 'number',
        display: 'Amount',
      },
      linked: {
        key: 'linked',
        type: 'bool',
        display: 'Linked',
      },
      details: {
        key: 'details',
        type: 'string',
        display: 'Details',
      },
      _ref: {
        key: '_ref',
        type: 'number',
        display: 'Ref #',
      },
      hasIssues: {
        key: 'hasIssues',
        type: 'bool',
        display: 'Has Issues',
      },
      hasPendingIssues: {
        key: 'hasPendingIssues',
        type: 'bool',
        display: 'Has Pending Issues',
      },
    },
  },
  batch: {
    multiFilter: {
      batchDateAfter: {
        key: 'createdAt',
        type: 'date',
        display: 'Date From',
        condition: 'isAfter',
      },
      batchDateBefore: {
        key: 'createdAt',
        type: 'date',
        display: 'Date To',
        condition: 'isBefore',
      },
      status: {
        key: 'status',
        type: 'option',
        display: 'Batch Status',
        options: {
          Scheduled: { display: 'Scheduled' },
          'Needs Approval': { display: 'Needs Approval' },
          'Pending...': { display: 'Pending' },
          'Processing...': { display: 'Processing' },
          'Verifying...': { display: 'Verifying' },
          'Funding...': { display: 'Funding' },
          'Tracking...': { display: 'Tracking' },
          Complete: { display: 'Completed' },
          Cancelled: { display: 'Cancelled' },
        },
      },
      batchTotal: {
        key: 'total',
        type: 'number',
        display: 'Total Amount',
      },
      cardTotal: {
        key: 'vCard',
        type: 'number',
        display: 'Card Amount',
      },
      checkTotal: {
        key: 'check',
        type: 'number',
        display: 'Check Amount',
      },
      achTotal: {
        key: 'ACH',
        type: 'number',
        display: 'ACH Amount',
      },
      batchId: {
        key: '_id',
        type: 'string',
        display: 'Batch Id',
      },
    },
    originalFilter: {
      status: {
        key: 'status',
        type: 'option',
        display: 'Batch Status',
        options: {
          Scheduled: { display: 'Scheduled' },
          'Needs Approval': { display: 'Needs Approval' },
          'Pending...': { display: 'Pending' },
          'Processing...': { display: 'Processing' },
          'Verifying...': { display: 'Verifying' },
          'Funding...': { display: 'Funding' },
          'Tracking...': { display: 'Tracking' },
          Complete: { display: 'Completed' },
          Cancelled: { display: 'Cancelled' },
        },
      },
      batchDate: {
        key: 'createdAt',
        type: 'date',
        display: 'Date',
      },
      paymentCount: {
        key: 'paymentCount',
        type: 'number',
        display: 'Number of Payments',
      },
      batchTotal: {
        key: 'total',
        type: 'number',
        display: 'Total Amount',
      },
      cardTotal: {
        key: 'vCard',
        type: 'number',
        display: 'Card Amount',
      },
      checkTotal: {
        key: 'check',
        type: 'number',
        display: 'Check Amount',
      },
      achTotal: {
        key: 'ACH',
        type: 'number',
        display: 'ACH Amount',
      },
    },
  },
};

