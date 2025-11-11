import { connect, Component } from 'component';

// Third Party Imports ...
// import { Collapse } from 'react-collapse';
import numeral from 'numeral';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  vCards: _try(() => state.account.cardsIntegration.data.resources.vCards),
  vCardsDenorm: _try(() => Selectors.cardsActivity(state)),
  paymentStatusesStatus: state.account.paymentStatuses.status,
  cardsIntegrationDetails: state.account.cardsIntegration.data.details,
  accounts: state.accounts.data.items,
  accountId: state.account.data.id,
  paymentIssues: state.account.paymentIssues.data.items,
  achIntegration: _try(() => state.account.achIntegration.data),
  checksIntegration: Selectors.integrations(state).checksIntegration,
  user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
  openVirtualCardModal: (id, name) => dispatch(Store.router.openModal('Components.modals.virtualcard', { id, name })),
  openTransactionHistoryModal: (id) => dispatch(Store.router.openModal('Components.modals.transactionhistory', { id })),
  openPaymentPresendModal: (id) => { dispatch(Store.router.openModal('Components.modals.paymentsend.modal', { id })); },
  downloadAttachment: (attachmentMetadata) => dispatch(Store.global.downloadAttachment(attachmentMetadata)),
});

class components_overviews_paymentstatus_modules_remittance extends Component {

  onActionClick = (title, id) => {
    this.props.openPaymentPresendModal(id);
  };

  downloadAllAttachments = () => {
    const receipts = _try(() => this.props.paymentStatus.sent.receipts);
    if (!receipts || !receipts.length) { return; }

    const actions = receipts.map((receipt) => this.props.downloadAttachment(receipt));
    Promise.all(actions)
      .then(() => {
        // handle success
      })
      .catch(() => {
        // handle error
      });
  };

  renderStatusBadge = () => {
    const { paymentStatus, additionalPaymentInfo } = this.props;
    const indexInProgress = _try(() => paymentStatus.statusDetails.indexInProgress);

    let color = '';
    let message = '';

    if (indexInProgress === 2) {
      color = 'secondary';
      message = 'Awaiting Funds';

      if (_try(() => paymentStatus.funded._errors.length)) {
        color = 'danger';
        message = 'Funding Error';
      }
    }

    if (indexInProgress === 3) {
      if (additionalPaymentInfo.linked) {
        color = 'secondary';
        message = 'PayClearly Concierge';
      } else {
        color = 'warning';
        message = 'Sending Required';
      }
    }

    if (indexInProgress === 4) {
      color = 'secondary';
      message = 'Awaiting Vendor Activity';
    }

    if (paymentStatus._status === 'tracked') {
      color = 'success';
      message = 'Complete';
    }

    if (paymentStatus._status === 'cancelled') {
      color = '';
      message = '';
    }

    if (additionalPaymentInfo.hasIssues) {
      color = 'danger';
      message = 'Issue';
    }


    return message ? <span className={`badge rounded-pill ms-3 bg-${color}`}>{message}</span> : null;
  };

  renderIssueHistory = () => {
    const { additionalPaymentInfo } = this.props;

    if (!_try(() => additionalPaymentInfo.resolvedIssues.length)) {
      return null;
    }

    return (
      <>
        <h4>Issue History</h4>
        <Components.overviews.resolvedissues
          resolvedIssues={additionalPaymentInfo.resolvedIssues}
        />
      </>
    );
  };

  renderProcessingDetails = () => {
    const { paymentStatus, additionalPaymentInfo } = this.props;
    const paymentSent = (paymentStatus.sent?.markedAsReadyToSendOrSent || !paymentStatus.sent?.waitingToBeMarkedAsSent);
    const data = {
      id: paymentStatus._id,
      actionTitle: !paymentSent && 'Send',
      onClick: this.onActionClick,
      beingHandledBy: paymentStatus.sent && paymentStatus.sent.beingHandledBy,
      isCancelled: paymentStatus._status === 'cancelled',
      paymentMethod: _try(() => paymentStatus.created.method),
      vendorIsLinked: additionalPaymentInfo.linked,
      automatable: paymentStatus.sent && paymentStatus.sent.automatable,
      status: paymentStatus._status,
    };

    if (data.status === 'sending'
      && data.actionTitle
      && !data.isCancelled
      && (!data.vendorIsLinked || !data.automatable)
    ) {
      return (
        <Components.button
          onClick={() => {
            data.onClick(data.actionTitle, data.id);
          }}
          onDisabledDoubleClick={() => {
            data.onClick(data.actionTitle, data.id);
          }}
          className="btn btn-success"
          type="button"
          aria-label="submit button"
          disabled={data.beingHandledBy}
          buttonText="Mark Payment Sent"
        />
      );
    }
    return null;
  };

  renderTrackedDetails = () => {
    const { paymentStatus } = this.props;
    const { sent } = paymentStatus;

    if (!_try(() => paymentStatus.sent.receipts.length)) {
      return null;
    }

    return (
      <>
        <h4>Receipts</h4>
        {sent.receipts.length > 1
          && (
            <div className="row mb-3">
              <div className="col-12">
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => { this.downloadAllAttachments(); }}
                  type="button"
                >
                  <div className="mdi mdi-download">
                    &nbsp;Download All
                  </div>
                </button>
              </div>
            </div>
          )}
        <Components.overviews.receipts
          attachments={sent.receipts}
          handleDownload={this.props.downloadAttachment}
          removing={this.props.paymentStatusesStatus.updating}
          columnClass="col-md-6 mt-2"
        />
      </>
    );
  };

  renderFundingDetails = () => {
    const { paymentStatus } = this.props;
    const indexInProgress = _try(() => paymentStatus.statusDetails.indexInProgress);
    if (indexInProgress === 2 && _try(() => paymentStatus.funded._errors.length)) {
      return (
        <div>
          <div className="alert alert-danger" role="alert">
            <h4 className="alert-heading">Something Went Wrong</h4>
            Error: {paymentStatus.funded._errors[paymentStatus.funded._errors.length - 1].message
              || paymentStatus.funded._errors[paymentStatus.funded._errors.length - 1].error}
          </div>
        </div>
      );
    }

    if (indexInProgress > 2) {

      if (paymentStatus.created.method === 'vCard') {
        const {
          user,
          vCards,
          vCardsDenorm,
          cardsIntegrationDetails,
        } = this.props;
        const { email = '' } = user.profile?.data?.item || {};
        const isSupportTeamUser = email.includes('@payclearly.com');
        const { provider } = cardsIntegrationDetails;
        const showPRN = provider === 'GALILEOSTUB' || provider === 'GALILEO';
        if (!paymentStatus.funded?.vCards) {
          // TODO add button to attempt a correction - PAY-420
          return (
            <div>
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Something Went Wrong</h4>
                The cards are not properly linked to this payment, please contact support for resolution.
              </div>
            </div>
          );
        }
        return (
          <>
            <h4>Card Details</h4>
            <div className="row">
              {paymentStatus.funded.vCards.map((card, index) => {
                // const virtualCard = this.props.vCards[card.id];
                const virtualCard = {
                  ...(vCards[card.id] || {}),
                  ..._try(() => vCardsDenorm.totalsByCard[card.id], {}) || {},
                  logo: _try(() => this.props.accounts[this.props.accountId].virtualCardLogo) || null,
                };

                if (!virtualCard) {
                  return null;
                }

                return (
                  <div className="col-12 col-md">
                    <h6 className="d-inline-block">Virtual Card {index + 1} of {paymentStatus.funded.vCards.length}</h6>
                    <Components.button
                      buttonText="Card"
                      onClick={() => this.props.openVirtualCardModal(card.id)}
                      ariaLabel="View Card"
                      className="btn btn-sm ms-2 btn-primary d-inline-block"
                    />
                    {((virtualCard.authorizationCount || 0) + (virtualCard.clearedCount || 0) + (virtualCard.declinedCount || 0)) > 0
                      && <Components.button
                        buttonText="Card Transactions"
                        onClick={() => { this.props.openTransactionHistoryModal(card.id); }}
                        ariaLabel="View Card Transactions"
                        className="btn btn-secondary btn-sm ms-2 d-inline-block"
                      />}
                    <div className="row">
                      <div className="col-xs-12 col-md-auto">
                        <strong>Card Number</strong>
                        <br />
                        <p className="text-muted">*{virtualCard.cardNumberLastFour}</p>
                      </div>
                      <div className="col-xs-12 col-md-auto">
                        <strong>Valid Through</strong>
                        <br />
                        <p className="text-muted">{Utils.dates.dateToDay(virtualCard.validThrough, 'dayOnly')}</p>
                      </div>
                      <div className="col-xs-12 col-md-auto">
                        {card.id && isSupportTeamUser && showPRN && (
                          <Components.cardPRN
                            cardId={card.id}
                          />
                        )}
                      </div>
                      {paymentStatus.sent?._at && (
                        <div className="col-xs-12 col-md-auto">
                          <strong>Submitted Date</strong>
                          <br />
                          <p className="text-muted">{Utils.dates.dateToDay(paymentStatus.sent._at, 'dayAndTime')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        );
      }

      if (paymentStatus.created.method === 'ACH') {
        const { achIntegration } = this.props;
        const achTranfser = _try(() => achIntegration.resources.transfers[paymentStatus.sent.thirdPartyPaymentId]);
        const achAccountDetails = _try(() => achIntegration.details);
        const validFundingSource = _try(() => achAccountDetails.fundingSource.id === achTranfser.from.split('_')[1]);

        if (paymentStatus.verified?.achDeliveryMethod === 'pullAch') {
          return (
            <>
              <h4>Transfer Details</h4>
              <div className="row">
                <div className="col-12 col-md-auto">
                  <strong>Pull ACH Account PRN</strong>
                  <br />
                  <p className="text-muted m-0">{paymentStatus.funded?.pullAchAccountId}</p>
                </div>
                <div className="col-12 col-md-auto">
                  <strong>Amount</strong>
                  <br />
                  <p className="text-muted">
                    {numeral(paymentStatus.created?.amount).format('$0,0.00')}
                  </p>
                </div>
                {paymentStatus.sent?._at && (
                  <div className="col-12 col-md-auto">
                    <strong>Submitted Date</strong>
                    <br />
                    <p className="text-muted">{Utils.dates.dateToDay(paymentStatus.sent._at, 'dayAndTime')}</p>
                  </div>
                )}
              </div>
            </>
          );

        }
        return (
          <>
            <h4>Transfer Details</h4>
            <div className="row">
              <div className="col-12 col-md-auto">
                <strong>Status</strong>
                <br />
                <p className="text-muted">
                  {_try(() => achTranfser.status.charAt(0).toUpperCase() + achTranfser.status.slice(1))}
                </p>
              </div>
              <div className="col-12 col-md-auto">
                <strong>Funding Source</strong>
                <br />
                {validFundingSource
                  && <>
                    <p className="text-muted m-0">{_try(() => achAccountDetails.fundingSource.bankName)}</p>
                    <p className="text-muted">{_try(() => achAccountDetails.fundingSource.name)}</p>
                  </>}
                {!validFundingSource
                  && <p className="text-muted m-0">Funding source has been removed</p>}
              </div>
              <div className="col-12 col-md-auto">
                <strong>Amount</strong>
                <br />
                <p className="text-muted">
                  {_try(() => numeral(achTranfser.amount).format('$0,0.00'))}&nbsp;{_try(() => achTranfser.currency)}
                </p>
              </div>
              <div className="col-12 col-md-auto">
                <strong>To</strong>
                <br />
                <p className="text-muted">{_try(() => paymentStatus.verified.vendor.name)}</p>
              </div>
              {paymentStatus.sent && paymentStatus.sent._at && (
                <div className="col-12 col-md-auto">
                  <strong>Submitted Date</strong>
                  <br />
                  <p className="text-muted">{Utils.dates.dateToDay(paymentStatus.sent?._at, 'dayAndTime')}</p>
                </div>
              )}
            </div>
          </>
        );

      }

      if (paymentStatus.created?.method === 'check') {
        const { checksIntegration } = this.props;
        const checkData = _try(() => checksIntegration.data.resources.checks[paymentStatus._id], {});

        return (
          <>
            <h4>Check Details</h4>
            <div className="row">
              <div className="col-12 col-md-auto">
                <strong>Shipping</strong>
                <br />
                <p className="text-muted">{_try(() => Utils.capitalize(checkData.shippingMethod))}</p>
              </div>
              <div className="col-12 col-md-auto">
                <strong>Status</strong>
                <br />
                <p className="text-muted">{_try(() => Utils.capitalize(checkData.status))}</p>
              </div>
              <div className="col-12 col-md-auto">
                <strong>Amount</strong>
                <br />
                <p className="text-muted">
                  {_try(() => numeral(checkData.amount).format('$0,0.00'))}&nbsp;{_try(() => checkData.currency)}
                </p>
              </div>
              <div className="col-12 col-md-auto">
                <strong>To</strong>
                <br />
                <p className="text-muted m-0">
                  {_try(() => paymentStatus.verified.vendor.displayName || paymentStatus.verified.vendor.name)}
                </p>
                <p className="text-muted m-0">{_try(() => checkData.addressLine1)}</p>
                <p className="text-muted m-0">{_try(() => checkData.addressLine2)}</p>
                <p className="text-muted">
                  {_try(() => checkData.city)}, {_try(() => checkData.stateProv)} {_try(() => checkData.postalCode)}
                </p>
              </div>
              {paymentStatus.sent && paymentStatus.sent._at && (
                <div className="col-12 col-md-auto">
                  <strong>Submitted Date</strong>
                  <br />
                  <p className="text-muted">{Utils.dates.dateToDay(paymentStatus.sent?._at, 'dayAndTime')}</p>
                </div>
              )}
            </div>
          </>
        );
      }
      return null;
    }

    return null;

  };

  render() {
    const { paymentStatus, additionalPaymentInfo } = this.props;

    return (
      <>
        <hr className="m-0" />
        <h2 className="m-0 py-3 d-inline-block">Remittance</h2>
        {this.renderStatusBadge()}
        <div className="components_overviews_paymentstatus_modules_remittance ps-4">
          {additionalPaymentInfo.hasIssues
            && paymentStatus._issueIds?.length > 0
            && paymentStatus._issueIds
              .map((issueId) => {
                if (_try(() => this.props.paymentIssues[issueId]._status) !== 'pending') {
                  return null;
                }

                return (
                  <div className="pb-3">
                    <div className="card card-body">
                      <Components.entities.paymentstatusissue
                        paymentId={paymentStatus._id}
                        issueId={issueId}
                      />
                    </div>
                  </div>

                );
              })}
          <div className="pb-3">
            {this.renderFundingDetails()}
            {this.renderIssueHistory()}
            {this.renderProcessingDetails()}
            {this.renderTrackedDetails()}
          </div>
        </div>
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_paymentstatus_modules_remittance);


