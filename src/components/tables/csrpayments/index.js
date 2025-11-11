import { connect, Component, Fragment } from 'component';

// Third Party Imports ...
import numeral from 'numeral';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const GALILEO = 'GALILEO';

const mapStateToProps = (state, props) => ({
  csrPayments: Selectors.csrPaymentsTableData(state),
  filteredAndSortedItems: Selectors.tableItems('Components.tables.csrpayments', props.tableKey, 'Selectors.csrPaymentsTableData(state)')(state),
  baseUrl: state.router.baseUrl,
  isOps: state.appConfig.data.metadata.name === 'ops',
  orgId: state.organization.data.id,
  accountId: state.account.data.id,
  keys: _resolve(state.account.paymentStatuses.collections.paymentKeys, `${state.organization.data.id}/${state.account.data.id}`, {}),
  achIntegrationDetails: state.account.achIntegration.data.details,
  checksIntegrationDetails: state.account.checksIntegration.data.details,
});

const mapDispatchToProps = (dispatch, props) => ({
  openAreYouSureModal: (data) => { dispatch(Store.router.openModal('Components.modals.areyousure', data)); },
  openPaymentPresendModal: (id) => { dispatch(Store.router.openModal('Components.modals.csrpaymentsend.modal', { id })); },
  openUploadReceiptModal: (id) => { dispatch(Store.router.openModal('Components.modals.uploadreceipt', { id })); },
  openManageReceiptModal: (id) => { dispatch(Store.router.openModal('Components.modals.managereceipt', { id })); },
  openChangePaymentMethodModal: (args) => { dispatch(Store.router.openModal('Components.modals.revisepaymentmethod', { ...args })); },
  openPaymentStatusVirtualCardsModal: (id) => { dispatch(Store.router.openModal('Components.modals.paymentstatusvirtualcards', { id })); },
  sendPaymentForm: (id) => { dispatch(Store.account.updatePaymentPipelines([id], 'sendPaymentForm')); },
  downloadAttachment: (attachmentMetadata) => dispatch(Store.global.downloadAttachment(attachmentMetadata)),
  markPaymentAsCancelled: (id, params) => { dispatch(Store.account.updatePaymentPipelines([id], 'cancelPayments', params)); },
  markPaymentsAsCancelled: (ids, params) => { dispatch(Store.account.updatePaymentPipelines(ids, 'cancelPayments', params)); },
  markPaymentsAsSent: (ids, params) => { dispatch(Store.account.updatePaymentPipelines(ids, 'markAsSent', params)); },
  clearPaymentErrors: (id, step) => { dispatch(Store.account.updatePaymentPipelines([id], 'clearPaymentErrors', { step })); },
  openViewNotificationsModal: (data) => { dispatch(Store.router.openModal('Components.modals.viewnotifications', { ...data })); },
  getPayments: (currentIndex) => { dispatch(Store.account.getRangeOfPayments(currentIndex)); },
  syncResources: (id) => { dispatch(Store.account.syncResources(id)); },
});

class components_tables_csrpayments extends Component {
  state = {
    columns: [
      {
        label: '', dataKey: 'hasErrorsStatus', sortable: true, cellRenderer: (data, paymentId, paymentStatus) => <Components.badges.error paymentStatus={paymentStatus} />,
      },
      {
        label: 'Status', dataKey: 'status', sortable: true, cellRenderer: (data = '', paymentId, paymentStatus) => <Components.badges.pipelineStatusNew data={paymentStatus} />,
      },
      {
        label: '', dataKey: 'beingHandledBy', sortable: true, cellRenderer: (data, paymentId, paymentStatus) => <Components.badges.beingHandledBy paymentStatus={paymentStatus} />,
      },
      {
        label: '', dataKey: 'hasIssuesStatus', sortable: true, cellRenderer: (data, paymentId, paymentStatus) => <Components.badges.reversal data={paymentStatus} />,
      },
      {
        label: 'Date', dataKey: 'createdAt', sortable: true, default: 'Unknown', cellRenderer: (date, paymentId, paymentStatus) => (paymentStatus.cardExpiringSoon ? <Components.tooltip className="float-start text-danger"><div>{Utils.dates.dateToDay(date)}</div><div>Card Expiring Soon</div></Components.tooltip> : Utils.dates.dateToDay(date)), exportFormatter: Utils.dates.dateToDay,
      },
      {
        label: 'To', dataKey: 'vendorName', sortable: true, default: 'Unknown',
      },
      {
        label: 'Amount', dataKey: 'amount', sortable: true, default: 'Unknown', cellRenderer: FormatAmount, exportFormatter: FormatAmount,
      },
      {
        label: 'Method', dataKey: 'method', sortable: true, cellRenderer: (data) => <Components.badges.acceptsmethod data={data} />,
      },
      {
        label: 'Ref #', dataKey: 'refNumber', sortable: true, cellRenderer: (data, paymentStatusId, paymentStatus) => this.refRenderer(paymentStatus), exportFormatter: FormatRef,
      },
      {
        label: 'Delivery', dataKey: 'deliveryIssue', sortable: true, cellRenderer: DeliveryIssue, exportFormatter: (deliveryIssue) => (deliveryIssue ? 'Issue' : 'No Issue'),
      },
      { label: 'Vertical', dataKey: 'tagName', sortable: true },
      { label: 'Group', dataKey: 'groupName', sortable: true },
      {
        label: 'Type', dataKey: 'psopDeliveryMethod', sortable: true, sortKey: 'psopDeliveryMethodOrder', tieBreakKey: 'psopName', cellRenderer: (data, paymentId, payment) => <Components.badges.psopDeliveryMethod data={data} />,
      },
      {
        label: 'Notes', dataKey: 'opsNotes', sortable: true, sortKey: 'opsNotes', tieBreakKey: 'createdAt', cellRenderer: (data, paymentStatusId, paymentStatus) => (data.length ? data.length : null),
      },
    ],
  };





  onActionClick = (title, id) => {
    if (this.props.isOps) {
      this.props.syncResources(id);
    }
    this.props.openPaymentPresendModal(id);
  };

  refRenderer = (paymentStatus) => {
    const {
      baseUrl,
      accountId,
      orgId,
      isOps,
    } = this.props;

    const path = `${baseUrl}/csrpayment/${paymentStatus._id}/?orgId=${orgId}&accountId=${accountId}`;

    return isOps ? (
      <Components.clicktocopytextwrapper
        value={path}
        showTooltip
        stopPropagation
        copyText
      >
        <div>{FormatRef(paymentStatus._ref)}<i className="mdi mdi-link-variant text-primary mdi-8px ms-1" /></div>
      </Components.clicktocopytextwrapper>
    )
      : (<div>{FormatRef(paymentStatus._ref)}</div>);
  };

  cancellablePaymentIds = (ids) => ids.reduce((acc, id) => {
    const { csrPayments, achIntegrationDetails, checksIntegrationDetails } = this.props;
    const paymentStatus = csrPayments[id];
    if (
      Utils.paymentCanBeCancelled(paymentStatus, {
        achIntegrationProvider: achIntegrationDetails.provider,
        checksIntegrationProvider: checksIntegrationDetails.provider,
      })) {
      acc.push(id);
    }
    return acc;
  }, []);

  sendablePaymentIds = (ids) => ids.reduce((acc, id) => {
    if (_try(() => this.props.csrPayments[id]._status === 'sending' && !this.props.csrPayments[id].sent.markedAsReadyToSendOrSent)) { acc.push(id); }
    return acc;
  }, []);

  _generateActionContent = (rowData) => {
    const popoverContent = [];

    const id = rowData._id;
    const isCancelled = rowData._status === 'cancelled';
    const isTracked = rowData._status === 'tracked';
    const status = rowData._status;
    const paymentFormSent = _try(() => rowData.sent.paymentFormSent);
    const achRemittanceSent = _try(() => rowData.sent.thirdPartyPaymentId && rowData.sent.thirdPartyPaymentId !== 'none' && rowData.sent.notificationsSent.length);

    const statusToStepMap = {
      creating: 'created',
      verifying: 'verified',
      funding: 'funded',
      sending: 'sent',
      tracking: 'tracked',
    };

    const step = statusToStepMap[rowData._status];

    if (!isCancelled && !isTracked && rowData[step]?._errors?.length) {

      popoverContent.push({
        title: 'Clear Errors',
        onClick: () => { this.props.clearPaymentErrors(id, step); },
        disabled: false,
      });
    }

    if (!_try(() => rowData.created.method === 'check') && status === 'sending' && !rowData.paymentSent && !isCancelled && (rowData.linked || _try(() => rowData.sent.automatable))) {
      popoverContent.push({
        title: 'CSR Send',
        onClick: () => { this.onActionClick('CSR Send', rowData._id); },
        disabled: _try(() => rowData.sent.beingHandledBy),
        onDisabledDoubleClick: () => { this.onActionClick('CSR Send', rowData._id); },
      });
    }

    if (_try(() => rowData.created.method === 'vCard') && _try(() => rowData.funded.vCards.length)) {
      popoverContent.push({
        title: 'View Virtual Cards',
        onClick: () => { this.props.openPaymentStatusVirtualCardsModal(id); },
        disabled: false,
      });
    }

    if (rowData.paymentSent && _try(() => rowData.created.method === 'vCard') && (!rowData.sent.receipts || !rowData.sent.receipts.length || rowData.sent.receipts.length < rowData.funded.vCards.length)) {
      popoverContent.push({
        title: 'Upload Receipts',
        onClick: () => { this.props.openUploadReceiptModal(id); },
        disabled: false,
      });
    }

    if (_try(() => rowData.sent.receipts) && rowData.sent.receipts.length) {
      popoverContent.push({
        title: 'Manage Receipts',
        onClick: () => { this.props.openManageReceiptModal(id); },
        disabled: false,
      });
    }

    if (_try(() => rowData.sent.notificationsSent.length)) {
      popoverContent.push({
        title: 'View Payment Notification',
        onClick: () => { this.props.openViewNotificationsModal({ notificationIds: _try(() => rowData.sent.notificationsSent), title: 'Payment Notification Details' }); },
        disabled: false,
      });
    }

    if (!isCancelled && !isTracked && (paymentFormSent || achRemittanceSent)) {
      popoverContent.push({
        title: 'Resend Remittance',
        onClick: () => {
          this.props.openAreYouSureModal({
            title: 'Resend Remittance',
            content: 'You are about resend remittance information',
            noText: 'No',
            yesText: 'Yes',
            onYes: () => this.props.sendPaymentForm(id),
          });
        },
        disabled: false,
      });
    }

    if (paymentFormSent) {
      popoverContent.push({
        title: 'Download Remittance',
        onClick: () => {
          if (_try(() => rowData.sent.attachedPaymentForm)) {
            this.props.downloadAttachment(rowData.sent.attachedPaymentForm);
          }
        },
        disabled: false,
      });
    }

    if (
      Utils.paymentCanBeCancelled(rowData, {
        achIntegrationProvider: this.props.achIntegrationDetails.provider,
        checksIntegrationProvider: this.props.checksIntegrationDetails.provider,
      })
    ) {
      popoverContent.push({
        title: 'Cancel Payment',
        onClick: () => {
          this.props.openAreYouSureModal({
            title: 'Cancel Payment',
            content: 'You are about to cancel this payment.',
            noText: 'No',
            yesText: 'Yes',
            onYes: (params) => this.props.markPaymentAsCancelled(id, {}),
          });
        },
        disabled: false,
      });
    }

    if (rowData._status === 'creating' && !rowData.created?.legacyUploader && rowData.created?._errors) {
      popoverContent.push({
        title: 'Change Payment Method',
        onClick: () => {
          this.props.openChangePaymentMethodModal({
            paymentId: id,
            organizationId: this.props.orgId,
            accountId: this.props.accountId,
            currentMethod: rowData.created?.method,
            methodOptions: (rowData.created?.methodOptions || ['vCard', 'ACH', 'check']).filter((m) => m !== rowData.created?.method),
          });
        },
        disabled: false,
      });
    }


    return popoverContent;
  };

  rowRenderer = (rowId, rowData, expanded) => (
    <div className="py-2">
      <div className="card mb-2">
        <h4 className="card-title mt-3 ms-3">CSR View</h4>
        <div className="px-3">
          <Components.overviews.csrPaymentStatus id={rowId} paymentStatus={rowData} />
        </div>
      </div>
      <div className="card">
        <h4 className="card-title mt-3 ms-3">User View</h4>
        <div>
          <Components.overviews.paymentstatus.view id={rowId} csrView />
        </div>
      </div>
    </div>
  );

  handleLoadResource = (currentIndex) => {
    const lengthOfKeys = Object.keys(this.props.keys).length;
    const currentResourceLength = Object.keys(this.props.csrPayments).length;

    if (currentResourceLength === lengthOfKeys) { return; }

    if (currentIndex >= currentResourceLength / 2) {
      this.props.getPayments(currentIndex);
    }
  };

  render() {
    const { csrPayments, filteredAndSortedItems = [] } = this.props;

    return (
      <Components.tables.components.collapsibleTable
        tableName="Components.tables.csrpayments"
        tableKey={this.props.tableKey}
        initialTableStateOverride={this.props.initialTableStateOverride}
        defaultTableState={{
          sort: {
            sortKey: 'refNumber',
            orderIn: 'desc',
          },
        }}
        data={{
          items: csrPayments,
          count: _try(() => Object.keys(csrPayments).length, 0),
        }}
        itemOrder={filteredAndSortedItems}
        columns={this.state.columns}
        rowRenderer={this.rowRenderer}
        typeForNoDataText="Payments"
        defaultSelectedRowId={this.props.newPaymentId || null}
        actions
        actionsInFirstColumn
        generateActionContent={this._generateActionContent}
        paginate
        initialRowsPerPage={25}
        enableExportCSV
        exportName="Payments"
        exportOptions={{
          type: 'payment', includeCustomFields: true, includeVendorId: true, includeBatchId: true, includeLineItems: true,
        }}
        additionalActions={[{
          title: 'Cancel All',
          onClick: () => this.props.openAreYouSureModal({
            title: 'Cancel Payments',
            content: `You are about to cancel ${this.cancellablePaymentIds(filteredAndSortedItems).length} payment(s).`,
            noText: 'No',
            yesText: 'Yes',
            onYes: () => this.props.markPaymentsAsCancelled(this.cancellablePaymentIds(filteredAndSortedItems), {}),
          }),
          disabled: this.cancellablePaymentIds(filteredAndSortedItems).length < 1,
        }, {
          title: 'Mark All as Sent',
          onClick: () => this.props.openAreYouSureModal({
            title: 'Mark Payments as Sent',
            content: `You are about to mark ${this.sendablePaymentIds(filteredAndSortedItems).length} payment(s) as sent.`,
            noText: 'No',
            yesText: 'Yes',
            onYes: () => this.props.markPaymentsAsSent(this.sendablePaymentIds(filteredAndSortedItems), {}),
          }),
          disabled: this.sendablePaymentIds(filteredAndSortedItems).length < 1,
        }]}
        handleLoadResource={this.handleLoadResource}
        keysLength={Object.keys(this.props.keys).length}
      />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_tables_csrpayments);

// Internal Helper Functions ...
const FormatRef = (refNumber) => `P_${refNumber}`;

function FormatAmount(amount) {
  return (amount) ? numeral(amount).format('$0,0.00') : null;
}

function DeliveryIssue(data) {
  if (data) {
    return (
      <span className="text-danger">
        {data && <i className="mdi mdi-alert-circle-outline" />}
      </span>
    );
  }
  return (
    <span className="text-success">
      <i className="mdi mdi-check" />
    </span>
  );
}

function isGalileoCheckOrACHPayment(paymentMethod, achIntegrationDetails, checksIntegrationDetails) {
  return (paymentMethod === 'ACH' && achIntegrationDetails.provider === 'GALILEO')
    || (paymentMethod === 'check' && checksIntegrationDetails.provider === GALILEO);
}

// GENERATOR_TYPE='component';
