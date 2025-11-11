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
    orgId: state.organization.data.id,
    accountId: state.account.data.id,
    organizations: state.organizations.data.items,
    accounts: state.accounts.data.items,
    pendingRefunds: state.account.accountBalances.data.item.pendingRefunds,
    creditLimitSync: state.account.accountBalances.data.item.creditLimitSync,
    paymentStatuses: state.account.paymentStatuses,
    fundingDetails: Selectors.funding(state),
    canUpdateWithdrawals: Selectors.entity('achTransfers_*_*')(state).canUpdate,
    achIntegrationDetails: state.account.achIntegration.data.details,
    checksIntegrationDetails: state.account.checksIntegration.data.details,
  });

const mapDispatchToProps = (dispatch, props) => ({
    openSubmitQueuedResolvedIssues: (data) => { dispatch(Store.router.openModal('Components.modals.submitQueuedResolvedIssues', data)); },
    openPaymentPresendModal: (id) => { dispatch(Store.router.openModal('Components.modals.paymentsend.modal', { id })); },
    markBatchAsCancelled: (ids, params) => { dispatch(Store.account.updatePaymentPipelines(ids, 'cancelPayments', params)); },
    openSchedulerModal: (ids, payAt) => dispatch(Store.router.openModal('Components.modals.scheduler', { ids, payAt })),
    openAreYouSureModal: (data) => { dispatch(Store.router.openModal('Components.modals.areyousure', data)); },
  });

class components_cards_exceptions extends Component {
  state = {
    tableKey: 'exceptions',
  };

  componentDidMount() {
  }

  componentWillUnmount() {}

  onActionClick(title, id) {
    this.props.openPaymentPresendModal(id);
  }

  cancelBatch = (paymentsForBatch) => {
    const paymentsThatCanBeCancelled = paymentsForBatch.filter((id) => Utils.paymentCanBeCancelled(this.props.paymentStatuses.data.items[id], {
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

  render() {
    const {
 orgId, accountId, organizations, accounts, fundingDetails, 
} = this.props;
    const pendingResolvedIssues = _try(() => fundingDetails.pendingResolvedIssues);
    const pendingResolvedIssueIds = pendingResolvedIssues && Object.keys(pendingResolvedIssues);

    return (
      <div className="components_cards_exceptions">
        <h3>{_try(() => organizations[orgId].name)} {'>'} <span className="text-primary">{_try(() => accounts[accountId].name)}</span></h3>
        <Components.tabs defaultTab="payments">
          <Components.tab name="payments" label="Payments" iconClassName="mdi-cash-multiple" isValidTab>
            {!this.props.paymentStatuses.status.fetched || this.props.paymentStatuses.status.fetching
              ? <Components.spinner />
              : <Fragment>
                <Components.tables.components.multiFilter
                  tableName="Components.tables.csrpayments"
                  tableKey={this.state.tableKey}
                  filterConfig={filterConfig.payments.multiFilter}
                />
                <Components.tables.csrpayments
                  tableKey={this.state.tableKey}
                />
              </Fragment>}
          </Components.tab>
          <Components.tab name="transfers" label="Transfers" iconClassName="mdi-credit-card-outline" isValidTab>
            <Components.tables.csrtransfers />
          </Components.tab>
        </Components.tabs>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_cards_exceptions);

// Internal Helper Functions ... 
const filterConfig = {
  payments: {
    multiFilter: {
      vendorName: {
        key: 'vendorName',
        type: 'string',
        display: 'Vendor',
      },
      createdAtAfter: {
        key: 'createdAt',
        type: 'date',
        display: 'Date From',
        condition: 'isAfter',
      },
      createdAtBefore: {
        key: 'createdAt',
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
          check: { display: 'Check' },
          ACH: { display: 'ACH' },
        },
      },
      amount: {
        key: 'amount',
        type: 'number',
        display: 'Amount',
      },
      refNumber: {
        key: 'refNumber',
        type: 'number',
        display: 'Ref #',
      },
      tagName: {
        key: 'tagName',
        type: 'string',
        display: 'Vertical',
      },
      groupName: {
        key: 'groupName',
        type: 'string',
        display: 'Group',
      },
      psopDeliveryMethod: {
        key: 'psopDeliveryMethod',
        type: 'option',
        display: 'Type',
        options: {
          Phone: { display: 'Phone' },
          Fax: { display: 'Fax' },
          Email: { display: 'Email' },
          Portal: { display: 'Portal' },
          Automation: { display: 'Automation' },
          Unknown: { display: 'Unknown' },
        },
      },
      deliveryIssue: {
        key: 'deliveryIssue',
        type: 'bool',
        display: 'Has Delivery Issue',
      },
      hasActiveErrors: {
        key: 'hasActiveErrors',
        type: 'bool',
        display: 'Has Active Errors',
      },
      cardExpiringSoon: {
        key: 'cardExpiringSoon',
        type: 'bool',
        display: 'Card Expiring Soon',
      },
      errorMessage: {
        key: 'errorMessage',
        type: 'string',
        display: 'Error Message',
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
      createdAt: {
        key: 'createdAt',
        type: 'date',
        display: 'Date',
      },
      vendorName: {
        key: 'vendorName',
        type: 'string',
        display: 'To',
      },
      amount: {
        key: 'amount',
        type: 'number',
        display: 'Amount',
      },
      method: {
        key: 'method',
        type: 'option',
        display: 'Method',
        options: {
          vCard: { display: 'Card' },
          check: { display: 'Check' },
          ACH: { display: 'ACH' },
        },
      },
      refNumber: {
        key: 'refNumber',
        type: 'number',
        display: 'Ref #',
      },
      tagName: {
        key: 'tagName',
        type: 'string',
        display: 'Vertical',
      },
      groupName: {
        key: 'groupName',
        type: 'string',
        display: 'Group',
      },
      psopDeliveryMethod: {
        key: 'psopDeliveryMethod',
        type: 'option',
        display: 'Type',
        options: {
          Phone: { display: 'Phone' },
          Fax: { display: 'Fax' },
          Email: { display: 'Email' },
          Portal: { display: 'Portal' },
          Automation: { display: 'Automation' },
          Unknown: { display: 'Unknown' },
        },
      },
      deliveryIssue: {
        key: 'deliveryIssue',
        type: 'bool',
        display: 'Has Delivery Issue',
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
      hasErrors: {
        key: 'hasErrors',
        type: 'bool',
        display: 'Has Errors',
      },
      hasActiveErrors: {
        key: 'hasActiveErrors',
        type: 'bool',
        display: 'Has Active Errors',
      },
      cardExpiringSoon: {
        key: 'cardExpiringSoon',
        type: 'bool',
        display: 'Card Expiring Soon',
      },
    },
  },
  batch: {
    multiFilter: {
      batchDateAfter: {
        key: 'batchDate',
        type: 'date',
        display: 'Date From',
        condition: 'isAfter',
      },
      batchDateBefore: {
        key: 'batchDate',
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
        key: 'batchTotal',
        type: 'number',
        display: 'Total Amount',
      },
      cardTotal: {
        key: 'cardTotal',
        type: 'number',
        display: 'Card Amount',
      },
      checkTotal: {
        key: 'checkTotal',
        type: 'number',
        display: 'Check Amount',
      },
      achTotal: {
        key: 'achTotal',
        type: 'number',
        display: 'ACH Amount',
      },
      batchId: {
        key: 'batchId',
        type: 'string',
        display: 'Batch Id',
      },
      details: {
        key: 'details',
        type: 'string',
        display: 'Details',
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
        key: 'batchDate',
        type: 'date',
        display: 'Date',
      },
      paymentCount: {
        key: 'paymentCount',
        type: 'number',
        display: 'Number of Payments',
      },
      batchTotal: {
        key: 'batchTotal',
        type: 'number',
        display: 'Total Amount',
      },
      cardTotal: {
        key: 'cardTotal',
        type: 'number',
        display: 'Card Amount',
      },
      checkTotal: {
        key: 'checkTotal',
        type: 'number',
        display: 'Check Amount',
      },
      achTotal: {
        key: 'achTotal',
        type: 'number',
        display: 'ACH Amount',
      },
      details: {
        key: 'details',
        type: 'string',
        display: 'Details',
      },
    },
  },
};

