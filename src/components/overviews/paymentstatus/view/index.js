/* eslint-disable max-len */
import {
  connect, Component, bindActionCreators, Fragment,
} from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  paymentStatus: state.account.paymentStatuses.data.items[props.id],
  vendors: state.account.accountVendors.data.items,
  users: state.users.data.items,
  organizationId: state.organization.data.id,
  paymentIssuesDenorm: Selectors.paymentIssues(state),
  paymentIssues: state.account.paymentIssues.data.items,
  achIntegrationFetched: _try(() => state.account.achIntegration.status.fetched),
  providerTheme: Selectors.providerTheme(state),
  clientsData: _resolve(state, 'account.clients.data.items', {}),
  clientsCollections: _resolve(state, 'account.clients.collections', {}),
  isOps: state.appConfig.data.metadata.name === 'ops',
  userId: state.user.access.data.uid,
  paymentPipelinePreferences: state.account.paymentPipelinePreferences.data.item,
  paymentBatch: state.account.batchPayments.data.items,
  achIntegrationDetails: state.account.achIntegration.data.details,
  checksIntegrationDetails: state.account.checksIntegration.data.details,
});

const mapDispatchToProps = (dispatch) => ({
  openVirtualCardModal: (id, name) => dispatch(Store.router.openModal('Components.modals.virtualcard', { id, name })),
  openAreYouSureModal: (data) => { dispatch(Store.router.openModal('Components.modals.areyousure', data)); },
  markPaymentAsCancelled: (id, params) => { dispatch(Store.account.updatePaymentPipelines([id], 'cancelPayments', params)); },
  markPaymentAsApproved: (id, params) => { dispatch(Store.account.updatePaymentPipelines([id], 'approvePayment', params)); },
  goToInvoiceTable: (routeParams, routeOptions) => { dispatch(Store.router.navigateTo('invoices', routeParams, routeOptions)); },
  syncResources: (id) => { dispatch(Store.account.syncResources(id)); },
});

class components_overviews_paymentstatus_view extends Component {
  state = {};

  componentDidMount() {
    if (this.props.isOps) {
      this.props.syncResources(this.props.id);
    }
  }

  navigateToInvoice = (id) => {
    this.props.goToInvoiceTable({ invoice: id });
  };

  renderOverviewStatus = (hasIssues, linked) => {
    const paymentStatus = this.props.paymentStatus || {};

    let status = paymentStatus.status || 'Scheduled';
    if (paymentStatus._status === 'cancelled') {
      status = 'Cancelled';
    }

    let statusColor;
    let message;
    let icon;

    if (hasIssues) {
      statusColor = 'danger';
      icon = 'exclamation';
      message = 'There is an issue with the payment remittance. This usually is a result of a vendor initiated refund or failure to process a payment. Please see "Remittance" below for details.';
    } else if (paymentStatus._status === 'cancelled') {
      statusColor = 'danger';
      icon = 'close';
      message = `This payment was cancelled during the "${paymentStatus.statusDetails.status}" step. This action is irreversible, but you may create an identical payment if needed.`;
    } else {
      const stepInProgress = paymentStatus.statusDetails.indexInProgress;

      if (paymentStatus.status === 'Complete') {
        statusColor = 'success';
        icon = 'check';
        message = (paymentStatus?.created?.method === 'check')
          ? 'The check has been printed and mailed.'
          : 'The vendor has successfully processed the payment, and any transactions have cleared. The payment is complete.';
      } else if (stepInProgress === 4) {
        statusColor = 'secondary';
        icon = 'progress-check';
        const selfServePayment = _try(() => paymentStatus.verified.selfServe || paymentStatus.created.selfServe);
        message = _try(() => paymentStatus.created.method === 'check' && !selfServePayment, false)
          ? 'This payment will be marked as tracked when it has entered the mail stream.'
          : `The payment is in the hands of the vendor. ${this.props.providerTheme.displayName} is awaiting confirmation from the vendor that they successfully processed the payment.`;
      } else if (stepInProgress === 3) {
        // processing step

        if (linked) {
          statusColor = 'secondary';
          icon = 'progress-check';
          message = `The payment is running through ${this.props.providerTheme.displayName}'s quality assurance process, and will be delivered to the vendor on your behalf.`;
        } else {
          statusColor = 'warning';
          icon = 'exclamation';
          message = `The payment has run through ${this.props.providerTheme.displayName}'s quality assurance process. Since this vendor is not linked to ${this.props.providerTheme.displayName}, the payment needs to be delivered to the vendor by you.`;
        }
      } else if (stepInProgress === 2) {
        // funding step
        if (_try(() => paymentStatus.funded._errors.length)) {
          statusColor = 'danger';
          icon = 'exclamation';
          message = 'There was error during the funding process. Please see the remittance module below for more information.';
        } else {
          statusColor = 'secondary';
          icon = 'progress-check';
          message = `${this.props.providerTheme.displayName} is processing the funding of this payment.`;
        }
      } else if (stepInProgress === 1) {
        statusColor = 'secondary';
        icon = 'progress-check';
        message = `${this.props.providerTheme.displayName} is verifying the provided payment information, and handling any relevant ERP/accounting integration procedures.`;
      } else if (paymentStatus.statusDetails.status === 'Scheduled') {
        statusColor = 'secondary';
        icon = 'progress-clock';
        message = `This payment is scheduled to be submitted at ${Utils.dates.dateToDay(paymentStatus.created.payAt)}.`;
      } else {
        statusColor = 'secondary';
        icon = 'progress-check';
        message = _try(() => paymentStatus.created.requiresApproval) ? 'This payment needs to be approved before it can be processed.' : `${this.props.providerTheme.displayName} is preparing the payment for processing.`;
      }
    }

    return (
      <Fragment>
        <div className="d-flex align-items-center mb-2">
          <div className={`main-icon-container bg-${statusColor} d-flex justify-content-center align-items-center`}>
            <i className={`mdi mdi-${icon} mdi-48px text-white`} />
          </div>
          <h1 className="mb-0 ms-3">{status}</h1>
        </div>
        <div className={`card card-body border-${statusColor} small-padding`}>
          <h5>{'What\'s going on?'}</h5>
          <p className="m-0">{message}</p>
        </div>
      </Fragment>
    );
  };

  renderOverviewCard = (amount, hasIssues, linked) => {
    const paymentStatus = this.props.paymentStatus || {};
    const { vendors } = this.props;

    return (
      <div className="card card-with-label">
        <p className="card-label px-1"><strong>Overview</strong></p>
        <div className="card-body">
          <div className="row">
            <div className="col-8">
              {this.renderOverviewStatus(hasIssues, linked)}
            </div>
            {_try(() => paymentStatus.created)
              && <div className="col-4">
                <p className="text-muted mb-2">Amount: <strong>{amount.format('$0,0.00')}</strong></p>
                <p className="text-muted mb-2">Vendor: <strong>{_try(() => vendors[_try(() => paymentStatus.created.vendorId)].display)}</strong></p>
                {_resolve(paymentStatus, 'created.clientId') && _try(() => this.props.clientsData[this.props.clientsCollections._ids[paymentStatus.created.clientId]])
                  && <p className="text-muted mb-2">Client: <strong>{this.props.clientsData[this.props.clientsCollections._ids[paymentStatus.created.clientId]].display}</strong></p>}
                <p className="text-muted mb-2">For: <strong>{_try(() => paymentStatus.created.memo) || (_try(() => paymentStatus.created.options.isCommission) && 'Commission') || 'General payment'}</strong></p>
                {_try(() => paymentStatus.created.options.isCommission)
                  && <p className="text-muted mb-2">Commission Rate: <strong>{_try(() => `${paymentStatus.created.options.commissionRate.toString()}%`, 'N/A')}</strong></p>}
                <div className="d-flex align-items-center">
                  <p className="text-muted m-0">Method:&nbsp;</p>
                  <Components.badges.method data={_try(() => paymentStatus.created.method)} />
                </div>
                {
                  paymentStatus.created.invoiceId
                  && <p className="text-muted mb-2">Invoice: <Components.button buttonText="View Invoice" onClick={() => this.navigateToInvoice(paymentStatus.created.invoiceId)} /></p>
                }
              </div>}
          </div>
        </div>
      </div>
    );
  };

  render() {
    const { paymentStatus, achIntegrationDetails, checksIntegrationDetails } = this.props;
    if (!paymentStatus) { return null; }
    const method = _try(() => paymentStatus.created.method);
    if (method && (method === 'ACH' && !this.props.achIntegrationFetched)) { return <div style={{ height: '100px' }}><Components.horizontalLoader /></div>; }
    if (method && (method === 'ACH' && !this.props.achIntegrationFetched)) { return <div style={{ height: '100px' }}><Components.horizontalLoader /></div>; }

    const amount = numeral(_try(() => paymentStatus.created.amount));
    const { pendingPaymentIssues } = this.props.paymentIssuesDenorm;
    const pendingIssues = (paymentStatus._issueIds || []).filter((issueId) => pendingPaymentIssues[issueId] && pendingPaymentIssues[issueId]._status === 'pending');
    const hasIssues = Boolean(pendingIssues.length);
    const resolvedIssues = (paymentStatus._issueIds || []).filter((issueId) => _try(() => this.props.paymentIssues[issueId]._status === 'resolved'));

    const linked = _try(() => paymentStatus.verified.vendor.globalVendorRef);
    const showCancelButton = Utils.paymentCanBeCancelled(paymentStatus, {
      achIntegrationProvider: achIntegrationDetails.provider,
      checksIntegrationProvider: checksIntegrationDetails.provider,
    });

    return (
      <div className="components_overviews_paymentstatus_view p-4">
        <div className="row">
          <div className="col-12 mb-3">
            {this.renderOverviewCard(amount, hasIssues, linked)}
          </div>
        </div>
        <Components.overviews.paymentstatus.modules.details paymentStatus={paymentStatus} />
        <Components.overviews.paymentstatus.modules.vendorPaymentNotes paymentStatus={paymentStatus} />
        <Components.overviews.paymentstatus.modules.integrations paymentStatus={paymentStatus} />
        {!this.props.hideRemittance
          && <Components.overviews.paymentstatus.modules.remittance paymentStatus={paymentStatus} additionalPaymentInfo={{ hasIssues, linked, resolvedIssues }} />}
        {!this.props.hideCommunications
          && <Components.overviews.paymentstatus.modules.communications paymentStatus={paymentStatus} />}
        {!!_resolve(paymentStatus, 'created.lineItems', []).length && <Components.overviews.paymentstatus.modules.lineItems id={this.props.id} />}
        {showCancelButton
          && <Fragment>
            <hr className="m-0" />
            <div className={'row'}>
              <div className={'col-12'}>
                <Components.button
                  onClick={() => {
                    this.props.openAreYouSureModal({
                      title: 'Cancel Payment',
                      content: 'You are about to cancel this payment.',
                      noText: 'No',
                      yesText: 'Yes',
                      onYes: () => this.props.markPaymentAsCancelled(paymentStatus._id, {}),
                    });
                  }}
                  className="btn btn-secondary btn-outline mt-3 me-3"
                  type="button"
                  aria-label="submit button"
                  disabled={false}
                  buttonText={'Cancel Payment'}
                />
              </div>
            </div>
          </Fragment>}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_paymentstatus_view);

