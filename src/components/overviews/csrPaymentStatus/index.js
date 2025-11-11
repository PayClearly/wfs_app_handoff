import {
  connect, Component, Fragment,
} from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  paymentStatus: (props.paymentStatus ? props.paymentStatus : Selectors.csrPaymentsTableData(state)[props.id]) || {},
  taikoBots: state.account.taikoBots && state.account.taikoBots.data.items,
  taikoBotStatus: _resolve(state, 'account.taikoBots.status'),
  user: state.user,
});

const mapDispatchToProps = (dispatch) => ({
  openSendNotificationModal: (id, data) => {
    dispatch(Store.router.openModal('Components.modals.resendnotification', { id, ...data }));
  },
  openViewNotificationsModal: (data) => {
    dispatch(Store.router.openModal('Components.modals.viewnotifications', { ...data }));
  },
  openAreYouSureModal: (data) => { dispatch(Store.router.openModal('Components.modals.areyousure', data)); },
  updateTaikoBot: ({ id, status }) => { dispatch(Store.account.taikoBots.updateTaikoBotStatus({ id, status })); },
  fetchTaikoBots: (botId) => { dispatch(Store.account.taikoBots.fetchTaikoBots([botId])); },
  openPaymentPresendModal: (id) => {
    dispatch(Store.router.openModal('Components.modals.csrpaymentsend.modal', { id }));
  },
});

// Internal Helper Functions ...
const STEPS = ['created', 'verified', 'funded', 'sent', 'tracked'];
const STATUS_TO_STEP = {
  creating: 'created',
  verifying: 'verified',
  funding: 'funded',
  sending: 'sent',
  tracking: 'tracked',
};
const STEP_TO_STATUS = {
  created: 'creating',
  verified: 'verifying',
  funded: 'funding',
  sent: 'sending',
  tracked: 'tracking',
};

// eslint-disable-next-line camelcase
class components_overviews_csrPaymentStatus extends Component {
  state = {
    globalOnCreationNotificationsDelivered: null,
    globalOnCancellationNotificationsDelivered: null,
    globalOnCompletionNotificationsDelivered: null,
    showBotScreenshot: false,
  };

  componentDidMount() {
    if (this.props.paymentStatus.sent && this.props.paymentStatus.sent.taikoBotId) {
      this.props.fetchTaikoBots([this.props.paymentStatus.sent.taikoBotId]);
    }
  }

  toggleBotScreenshot = () => {
    this.setState((prevState) => ({
      ...prevState,
      showBotScreenshot: !prevState.showBotScreenshot,
    }));
  };

  setGlobalOnCreationNotificationsDelivered = (delivered) => {
    this.setState({ globalOnCreationNotificationsDelivered: delivered });
  };

  setGlobalOnCancellationNotificationsDelivered = (delivered) => {
    this.setState({ globalOnCancellationNotificationsDelivered: delivered });
  };

  setGlobalOnCompletionNotificationsDelivered = (delivered) => {
    this.setState({ globalOnCompletionNotificationsDelivered: delivered });
  };

  //    type, title: type === 'confirmation'
  //      ? 'Send Payment Confirmation Email'
  //      : 'Send Payment On The Way Email' }
  //   );
  // }

  renderErrorDetails = () => {
    const { paymentStatus } = this.props;

    const errors = [];
    STEPS.forEach((step) => {
      if (!_try(() => paymentStatus[step]._errors.length)) { return; }
      const stepErrors = paymentStatus[step]._errors;

      stepErrors.forEach((error) => { errors.push({ ...error, step }); });
    });

    errors.sort((errorA, errorB) => {
      if (errorA.step === STATUS_TO_STEP[paymentStatus._status]) { return -1; }
      if (errorB.step === STATUS_TO_STEP[paymentStatus._status]) { return 1; }

      if (_try(() => errorA.at > errorB.at)) { return -1; }
      if (_try(() => errorA.at < errorB.at)) { return 1; }

      if (_try(() => STEPS.findIndex(errorA.step) > STEPS.findIndex(errorB.step))) { return -1; }
      return 1;
    });

    return (
      <div className="row">
        {errors.map((error) => {
          let color = 'warning';
          if (error.step === STATUS_TO_STEP[paymentStatus._status]) { color = 'danger'; }
          if (paymentStatus._status === 'cancelled' || paymentStatus._status === 'tracked') { color = 'secondary'; }

          return (
            <div className="col-xs-12 col-md-12">
              <div className={`alert alert-${color}`} role="alert" style={{ whiteSpace: "pre-line"}}>
                <h5 className="alert-heading">
                  {STEP_TO_STATUS[error.step].charAt(0).toUpperCase()}{STEP_TO_STATUS[error.step].slice(1)} Error
                </h5>
                {(error._at && `${(new Date(error._at)).toString()} | `) || ''}Error: {error.error || error.message}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  renderGlobalCompletionNotificationOverview = () => {
    const { paymentStatus } = this.props;
    if (!_try(() => paymentStatus.tracked.globalOnCompletionNotifications.length)) { return null; }
    const emailsSent = paymentStatus.tracked.globalOnCompletionNotifications;

    return (
      <Fragment>
        <h5 className="d-inline-block">Global Completion Notifications</h5>
        {/* {paymentStatus._status !== 'cancelled' &&
          <Components.button
            buttonText={`${_try(() => paymentStatus.tracked.onTrackedNotificationsParams)
              ? 'Resend'
              : 'Email'
              } Confirmation`}
            onClick={() => this.openSendNotificationModal('confirmation')}
            ariaLabel="Resend Confirmation Notification"
            className="btn btn-sm btn-primary d-inline-block ms-2"
          />
        } */}
        {_try(() => emailsSent.length) > 1
          && <Components.button
            buttonText="View All"
            onClick={() => this.props.openViewNotificationsModal({
              notificationIds: _try(() => paymentStatus.tracked.globalOnCompletionNotifications),
              title: 'Completion Notification Details',
              doNotClearNotifications: true,
            })}
            ariaLabel="View All Completion Notifications"
            className="btn btn-sm ms-2 btn-secondary d-inline-block ms-2"
          />}
        <Components.overviews.notifications
          notificationIds={_try(() => paymentStatus.tracked.globalOnCompletionNotifications)}
          showLastOnly
          updateDeliveryStatus={this.setGlobalOnCompletionNotificationsDelivered}
          deliveryStatus={this.state.globalOnCompletionNotificationsDelivered}
        />
      </Fragment>
    );
  };

  renderGlobalCreationNotificationOverview = () => {
    const { paymentStatus } = this.props;
    if (!_try(() => paymentStatus.verified.globalOnCreationNotifications.length)) { return null; }
    const emailsSent = paymentStatus.verified.globalOnCreationNotifications;

    return (
      <Fragment>
        <h5 className="d-inline-block">Global Creation Notifications</h5>
        {/* {paymentStatus._status !== 'tracked' && paymentStatus._status !== 'cancelled' &&
          <Components.button
            buttonText="Resend"
            onClick={() => this.openSendNotificationModal('creation')}
            ariaLabel="Resend On The Way Notification"
            className="btn btn-sm btn-primary d-inline-block ms-2"
          />
        } */}
        {_try(() => emailsSent.length) > 1
          && <Components.button
            buttonText="View All"
            onClick={() => this.props.openViewNotificationsModal({
              notificationIds: _try(() => emailsSent),
              title: 'Creation Notification Details',
              doNotClearNotifications: true,
            })}
            ariaLabel="View All Creation Notifications"
            className="btn btn-sm ms-2 btn-secondary d-inline-block ms-2"
          />}
        <Components.overviews.notifications
          notificationIds={_try(() => emailsSent)}
          showLastOnly
          updateDeliveryStatus={this.setGlobalOnCreationNotificationsDelivered}
          deliveryStatus={this.state.globalOnCreationNotificationsDelivered}
        />
      </Fragment>
    );
  };

  renderGlobalCancellationNotificationOverview = () => {
    const { paymentStatus } = this.props;
    if (!_try(() => paymentStatus.verified.globalOnCancellationNotifications.length)) { return null; }
    const emailsSent = paymentStatus.verified.globalOnCancellationNotifications;

    return (
      <Fragment>
        <h5 className="d-inline-block">Global Cancellation Notifications</h5>
        {/* {paymentStatus._status === 'cancelled' &&
          <Components.button
            buttonText="Resend"
            onClick={() => this.openSendNotificationModal('cancellation')}
            ariaLabel="Resend Cancellation Notification"
            className="btn btn-sm btn-primary d-inline-block ms-2"
          />
        } */}
        {_try(() => emailsSent.length) > 1
          && <Components.button
            buttonText="View All"
            onClick={() => this.props.openViewNotificationsModal({
              notificationIds: _try(() => emailsSent),
              title: 'Cancellation Notification Details',
              doNotClearNotifications: true,
            })}
            ariaLabel="View All Cancellation Notifications"
            className="btn btn-sm ms-2 btn-secondary d-inline-block ms-2"
          />}
        <Components.overviews.notifications
          notificationIds={_try(() => emailsSent)}
          showLastOnly
          updateDeliveryStatus={this.setGlobalOnCancellationNotificationsDelivered}
          deliveryStatus={this.state.globalOnCancellationNotificationsDelivered}
        />
      </Fragment>
    );
  };

  renderTaikoBotOverview = () => {
    const { paymentStatus, taikoBots, user } = this.props;
    const bot = taikoBots && taikoBots[paymentStatus.sent.taikoBotId];
    const userRoles = user.roles.data.item.rootLevel;
    const isAdmin = userRoles.base_admin || userRoles.base_superAdmin;

    if (!bot) { return null; }
    const portalAutomatorDisabled = !(bot.status === 'paused' || bot.status === 'failed' || bot.status === 'retired');
    const pauseDisabled = bot.status !== 'queued' || !isAdmin;
    const startDisabled = bot.status !== 'paused' || !isAdmin;
    const retryDisabled = bot.status !== 'failed' || !isAdmin;
    const retireDisabled = !(bot.status === 'paused' || bot.status === 'failed') || !isAdmin;

    const pauseTaikoBot = () => {
      this.props.updateTaikoBot({ id: bot.id, status: 'paused' });
    };
    const startTaikoBot = () => {
      this.props.updateTaikoBot({ id: bot.id, status: 'queued' });
    };
    const retryTaikoBot = () => {
      startTaikoBot();
    };
    const retireTaikoBot = () => {
      this.props.openAreYouSureModal({
        title: 'Permanently retire bot',
        // eslint-disable-next-line max-len
        content: 'You are about to retire this bot. It will be archived and the payment will need to be completed manually',
        noText: 'No',
        yesText: 'Yes',
        onYes: () => this.props.updateTaikoBot({ id: bot.id, status: 'retired' }),
      });
    };
    const sendWithPortalAutomator = () => {
      this.props.openPaymentPresendModal(this.props.id);
    };

    return (
      <div className="card mb-3">
        <div className="card-header">Bot Details</div>

        <div className="card-body">
          <Components.overviews.taikoBot bot={bot} showScreenshot={this.state.showBotScreenshot} />
        </div>
        <div className="card-footer">
          {
            paymentStatus._status === 'sending' && bot.status === 'paused'
            && <Components.button
              buttonText={'Start Bot'}
              onClick={startTaikoBot}
              ariaLabel="Start Taiko Bot"
              className="btn btn-secondary d-inline-block mt-2 me-2 mb-2"
              icon={'mdi mdi-play'}
              disabled={startDisabled}
            />
          }
          {
            paymentStatus._status === 'sending' && bot.status === 'failed'
            && <Components.button
              buttonText={'Retry Bot'}
              onClick={retryTaikoBot}
              ariaLabel="Retry Taiko Bot"
              className="btn btn-secondary d-inline-block mt-2 me-2 mb-2"
              icon={'mdi mdi-refresh'}
              disabled={retryDisabled}
            />
          }
          {
            paymentStatus._status === 'sending' && (bot.status === 'queued' || bot.status === 'running')
            && <Components.button
              buttonText={'Pause Bot'}
              onClick={pauseTaikoBot}
              ariaLabel="Pause Taiko Bot"
              className="btn btn-secondary d-inline-block mt-2 me-2 mb-2"
              icon={'mdi mdi-pause'}
              disabled={pauseDisabled}
            />
          }
          {
            paymentStatus._status === 'sending' && bot.status !== 'retired'
            && <Components.button
              buttonText={'Retire Bot'}
              onClick={retireTaikoBot}
              ariaLable="Retire Taiko Bot"
              className="btn btn-secondary d-inline-block mt-2 me-2 mb-2"
              icon={'mdi mdi-robot-off'}
              disabled={retireDisabled}
            />
          }
          {
            paymentStatus._status === 'sending'
            && <Components.button
              buttonText={'Open CSR Send Modal'}
              onClick={sendWithPortalAutomator}
              ariaLabel="Open CSR Send Modal"
              className="btn btn-secondary d-inline-block mt-2 me-2 mb-2"
              icon={'mdi mdi-monitor'}
              disabled={portalAutomatorDisabled}
            />
          }
          {
            bot.errorScreenshot
            && <Components.button
              buttonText={this.state.showBotScreenshot ? 'Hide Bot Screenshot' : 'Show Bot Screenshot'}
              onClick={this.toggleBotScreenshot}
              ariaLabel="Toggle Bot Screenshot visibility"
              className="btn btn-secondary d-inline-block mt-2 me-2 mb-2"
            />
          }
        </div>
      </div>
    );
  };

  render() {
    const { paymentStatus, taikoBotStatus } = this.props;
    const paymentHasBot = paymentStatus.sent && paymentStatus.sent.taikoBotId;
    const botIsFetched = taikoBotStatus.fetched;
    return (
      <div className="components_overviews_csrPaymentStatus">
        {paymentStatus.hasErrors
          && (
            <Fragment>
              {this.renderErrorDetails()}
            </Fragment>
          )}
        {!paymentStatus.hasErrors
          && (
            <div className="d-flex align-items-center">
              <div>
                <h4 className="card-title mb-0">No Errors To Display</h4>
              </div>
              <div>
                <span className="text-success">
                  <i className="mdi mdi-check mdi-48px" />
                </span>
              </div>
            </div>
          )}
        {this.renderGlobalCompletionNotificationOverview()}
        {this.renderGlobalCancellationNotificationOverview()}
        {this.renderGlobalCreationNotificationOverview()}
        {paymentHasBot && botIsFetched && this.renderTaikoBotOverview()}
        <Components.overviews.opsNotes resource={paymentStatus} resourceType="paymentStatuses" />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_csrPaymentStatus);
