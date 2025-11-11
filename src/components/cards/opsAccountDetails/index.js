import React, { Component } from 'react';
import { connect } from 'react-redux';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  params: _resolve(state, 'router.route.params'),
  orgId: state.organization.data.id,
  accountId: state.account.data.id,
  organizations: state.organizations.data.items,
  accounts: state.accounts.data.items,
  pendingRefunds: state.account.accountBalances.data.item.pendingRefunds,
  creditLimitSync: state.account.accountBalances.data.item.creditLimitSync,
  paymentStatuses: state.account.paymentStatuses,
  fundingDetails: Selectors.funding(state),
  canUpdateWithdrawals: Selectors.entity('achTransfers_*_*')(state).canUpdate,
  globalItemsFetched: Selectors.csrGlobalItemsFetched(state),
  achIntegrationDetails: state.account.achIntegration.data.details,
  checksIntegrationDetails: state.account.checksIntegration.data.details,
});

const mapDispatchToProps = (dispatch, props) => ({
  openSubmitQueuedResolvedIssues: (data) => { dispatch(Store.router.openModal('Components.modals.submitQueuedResolvedIssues', data)); },
  openPaymentPresendModal: (id) => { dispatch(Store.router.openModal('Components.modals.paymentsend.modal', { id })); },
  markBatchAsCancelled: (ids, params) => { dispatch(Store.account.updatePaymentPipelines(ids, 'cancelPayments', params)); },
  openSchedulerModal: (ids, payAt) => dispatch(Store.router.openModal('Components.modals.scheduler', { ids, payAt })),
  openAreYouSureModal: (data) => { dispatch(Store.router.openModal('Components.modals.areyousure', data)); },
  syncQueuedResolvedIssues: () => { dispatch(Store.account.syncQueuedResolvedIssues()); },
  setQueryParams: (data) => { dispatch(Store.router.setQueryParams(data)); },
});

class components_cards_opsAccountDetails extends Component {
  state = {
    tableKey: 'opsAccountDetails',
    paymentStatusesLength: '',
  };

  componentDidMount() {
    const { accountId, orgId } = this.props;
    this.props.setQueryParams({ orgId, accountId });
    this.props.syncQueuedResolvedIssues();
  }

  componentWillReceiveProps(nextProps) {
    const { accountId, orgId } = nextProps;
    if (this.props.accountId !== nextProps.accountId) {
      this.props.setQueryParams({ orgId, accountId });
      this.props.syncQueuedResolvedIssues();
    }
  }



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
    const error = this.props.paymentStatuses.status.updatingError || '';
    return (
      <div className="components_cards_opsAccountDetails">
        <h3>{_try(() => organizations[orgId].name)} &gt; <span className="text-primary">{_try(() => accounts[accountId].name)}</span></h3>
        <Components.tabs defaultTab="payments">
          <Components.tab name="payments" label="Payments" iconClassName="mdi-cash-multiple" isValidTab>
            {!this.props.globalItemsFetched
              ? <Components.spinner />
              : <>
                <Components.tables.components.multiFilterAPIFirst
                  tableName="Components.tables.csrpayments"
                  tableKey={this.state.tableKey}
                  filterConfig={filterConfig.payments.multiFilter}
                />
                {error
                  && (
                    <div className="col-12">
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    </div>
                  )}
                <Components.tables.csrpaymentsAPIFirst
                  tableKey={this.state.tableKey}
                />
              </>}
          </Components.tab>
          <Components.tab name="transfers" label="Transfers" iconClassName="mdi-credit-card-outline" isValidTab>
            <Components.tables.csrtransfers />
          </Components.tab>
          <Components.tab name="withdrawalOverrides" label="Withdrawal Overrides" iconClassName="mdi-inbox-arrow-up" isValidTab>
            {!_try(() => this.props.paymentStatuses.status.fetched)
              && <Components.spinner />}
            {_try(() => this.props.paymentStatuses.status.fetched)
              && <>
                {this.props.canUpdateWithdrawals && pendingResolvedIssues && Boolean(pendingResolvedIssueIds.length)
                  && <Components.button
                    buttonText="Submit all Pending Withdrawals"
                    onClick={() => {
                      this.props.openSubmitQueuedResolvedIssues({
                        submitAll: true,
                        pendingResolvedIssueIds,
                      });
                    }}
                    ariaLabel="Submit all Pending Withdrawals"
                    className="btn btn-primary mt-4"
                  // disabled={disabled}
                  // updating={creating}
                  />}
                <Components.tables.resolvedIssues forCSR />
              </>}
          </Components.tab>
          <Components.tab name="transactionHistory" label="Transaction History" iconClassName="mdi-history" isValidTab>
            <Components.tables.virtualcardtransactionhistory />
          </Components.tab>
          <Components.tab name="syncCreditLimit" label="Sync Credit Limit" iconClassName="mdi-sync" isValidTab>
            {_try(() => this.props.creditLimitSync)
              ? <div className="col-12">
                <div className="d-flex align-items-center">
                  <i className="mdi text-danger mdi-alert-circle-outline mdi-36px" />
                  <h2 className="my-0 ms-1">{'Credit Limit Update Required'}</h2>
                </div>
                <h4 className="my-0 ms-1">{`Current Credit Limit: $${this.props.creditLimitSync.creditLimit} --- Target Credit Limit: $${this.props.creditLimitSync.targetCreditLimit}`}</h4>
                <p className="my-0 ms-1"><b>{accounts[accountId].name}</b> needs their credit limit <span>{`${this.props.creditLimitSync.creditLimit < this.props.creditLimitSync.targetCreditLimit ? 'increased' : 'decreased'}`}</span> to <b>${this.props.creditLimitSync.targetCreditLimit}</b>. Once this is updated, please allow some time for the system to recognize the update. If it is not resolved by the next day, get in touch with a developer.</p>
              </div>
              : <div className="col-12">
                <div className="d-flex align-items-center justify-content-center">
                  <i className="mdi text-success mdi-check mdi-48px" />
                  <h2 className="my-0 ms-1">Nothing to see here, Credit Limits are in sync!</h2>
                </div>
              </div>}
          </Components.tab>
          <Components.tab name="batchPayments" label="Batch Payments" iconClassName="mdi-hexagon-multiple" isValidTab>
            {!this.props.paymentStatuses.status.fetched || this.props.paymentStatuses.status.fetching
              ? <Components.spinner />
              : <>
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
              </>}
          </Components.tab>
        </Components.tabs>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_cards_opsAccountDetails);

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
          scheduled: { display: 'Scheduled' },
          needsApproval: { display: 'Needs Approval' },
          pending: { display: 'Pending' },
          verifying: { display: 'Verifying' },
          sending: { display: 'Processing' },
          funding: { display: 'Funding' },
          tracking: { display: 'Tracking' },
          complete: { display: 'Completed' },
          cancelled: { display: 'Cancelled' },
        },
      },
      hasIssues: {
        key: 'hasIssues',
        type: 'bool',
        display: 'Issue',
      },
      pendingIssues: {
        key: 'hasPendingIssues',
        type: 'bool',
        display: 'Pending Issues',
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
      details: {
        key: 'details',
        type: 'string',
        display: 'Details',
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
      last4s: {
        key: 'last4s',
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

// GENERATOR_TYPE='component';
