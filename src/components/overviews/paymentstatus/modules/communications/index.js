import { connect, Component } from 'component';

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = () => ({});

const mapDispatchToProps = (dispatch) => ({
  openSendNotificationModal: (id, data) => {
    dispatch(Store.router.openModal('Components.modals.resendnotification', { id, ...data }));
  },
  openViewNotificationsModal: (data) => {
    dispatch(Store.router.openModal('Components.modals.viewnotifications', { ...data }));
  },
});

// eslint-disable-next-line camelcase
class components_overviews_paymentstatus_modules_communications extends Component {
  state = {
    onTheWayNotificationDelivered: null,
    completionNotificationsDelivered: null,
  };

  setCompletionNotificationsDelivered = (delivered) => {
    this.setState({ completionNotificationsDelivered: delivered });
  };

  setonTheWayNotificationsDelivered = (delivered) => {
    this.setState({ onTheWayNotificationDelivered: delivered });
  };

  openSendNotificationModal = (type) => {
    this.props.openSendNotificationModal(this.props.paymentStatus._id, {
      type,
      title: type === 'confirmation'
        ? 'Send Payment Confirmation Email'
        : 'Send Payment On The Way Email',
    });
  };

  generateCommunicationBadges = (creationNotificationsSent, completionNotificationsSent, paymentStatus) => {
    const indexInProgress = _try(() => paymentStatus.statusDetails.indexInProgress);

    let completionMessage = 'Confirmation: None Sent';
    let completionColor = 'secondary';

    if (indexInProgress >= 5 && completionNotificationsSent) {
      if (!this.state.completionNotificationsDelivered) {
        completionMessage = 'Confirmation: Sent';
        completionColor = 'success';
      } else if (this.state.completionNotificationsDelivered === 'delivered') {
        completionMessage = 'Confirmation: Delivered';
        completionColor = 'success';
      } else if (this.state.completionNotificationsDelivered === 'notDelivered') {
        completionMessage = 'Confirmation: Failed Delivery';
        completionColor = 'danger';
      }
    }

    let onTheWayMessage = 'On The Way: None Sent';
    let onTheWayColor = 'secondary';

    if ((indexInProgress >= 5 || paymentStatus._status === 'cancelled') && !creationNotificationsSent) {
      onTheWayMessage = '';
      onTheWayColor = '';
    }

    if (creationNotificationsSent) {
      onTheWayMessage = 'On The Way: Sent';
      onTheWayColor = 'success';

      if (this.state.onTheWayNotificationDelivered === 'delivered'
        && indexInProgress < 5
        && paymentStatus._status !== 'cancelled') {
        onTheWayMessage = 'On The Way: Delivered';
        onTheWayColor = 'success';
      } else if (this.state.onTheWayNotificationDelivered === 'notDelivered'
        && indexInProgress < 5
        && paymentStatus._status !== 'cancelled') {
        onTheWayMessage = 'On The Way: Failed Delivery';
        onTheWayColor = 'danger';
      }
    }

    return (
      <>
        {onTheWayMessage
          && <span className={`badge rounded-pill ms-3 bg-${onTheWayColor}`}>{onTheWayMessage}</span>}
        {indexInProgress >= 5
          && <span className={`badge rounded-pill ms-3 bg-${completionColor}`}>{completionMessage}</span>}
      </>
    );
  };

  renderCompletionNotificationOverview = (emailsSent, paymentStatus) => {
    if (paymentStatus._status !== 'tracked') {
      return null;
    }

    return (
      <>
        <h5 className="d-inline-block">Confirmation Notifications</h5>
        {paymentStatus._status !== 'cancelled'
          && <Components.button
            buttonText={`${_try(() => paymentStatus.tracked.onTrackedNotificationsParams)
              ? 'Resend'
              : 'Email'} Confirmation`}
            onClick={() => this.openSendNotificationModal('confirmation')}
            ariaLabel="Resend Confirmation Notification"
            className="btn btn-sm btn-primary d-inline-block ms-2"
          />}
        {emailsSent > 1
          && <Components.button
            buttonText="View All"
            onClick={() => this.props.openViewNotificationsModal({
              notificationIds: _try(() => paymentStatus.tracked.onTrackedNotifications),
              title: 'Confirmation Notification Details',
              doNotClearNotifications: true,
            })}
            ariaLabel="View All Confirmation Notifications"
            className="btn btn-sm ms-2 btn-secondary d-inline-block ms-2"
          />}
        {emailsSent && (
          <Components.overviews.notifications
            notificationIds={_try(() => paymentStatus.tracked.onTrackedNotifications)}
            showLastOnly
            updateDeliveryStatus={this.setCompletionNotificationsDelivered}
            deliveryStatus={this.state.completionNotificationsDelivered}
          />
        )}
        {
          !emailsSent
          && <p className="text-muted mb-0 pb-3">No payment confirmation emails sent yet</p>
        }
      </>
    );
  };

  renderCreationNotificationOverview = (alreadySent, paymentStatus) => {
    const paymentIsActive = paymentStatus._status !== 'tracked' && paymentStatus._status !== 'cancelled';
    if (!alreadySent && !paymentIsActive) {
      return null;
    }

    return (
      <>
        <h5 className="d-inline-block">On The Way Notifications</h5>
        {alreadySent
          && (
            <>
              {paymentIsActive
                && <Components.button
                  buttonText="Resend"
                  onClick={() => this.openSendNotificationModal('creation')}
                  ariaLabel="Resend On The Way Notification"
                  className="btn btn-sm btn-primary d-inline-block ms-2"
                />}
              {_try(() => paymentStatus.verified.onCreationNotifications.length) > 1
                && <Components.button
                  buttonText="View All"
                  onClick={() => this.props.openViewNotificationsModal({
                    notificationIds: _try(() => paymentStatus.verified.onCreationNotifications),
                    title: 'On The Way Notification Details',
                    doNotClearNotifications: true,
                  })}
                  ariaLabel="View All On The Way Notifications"
                  className="btn btn-sm ms-2 btn-secondary d-inline-block ms-2"
                />}
              <Components.overviews.notifications
                notificationIds={_try(() => paymentStatus.verified.onCreationNotifications)}
                showLastOnly
                updateDeliveryStatus={this.setonTheWayNotificationsDelivered}
                deliveryStatus={this.state.onTheWayNotificationDelivered}
              />
            </>
          )}
        {!alreadySent && paymentIsActive
          && (
            <>
              <Components.button
                buttonText="Send"
                onClick={() => this.openSendNotificationModal('creation')}
                ariaLabel="Send On The Way Notification"
                className="btn btn-sm btn-primary d-inline-block ms-2"
              />
              <p className="text-muted mb-0 pb-3">No payment creation emails sent yet</p>
            </>
          )}
      </>
    );
  };

  render() {
    const { paymentStatus } = this.props;
    const creationNotificationsSent = _try(() => paymentStatus.verified.onCreationNotifications.length);
    const completionNotificationsSent = _try(() => paymentStatus.tracked.onTrackedNotifications.length);

    if (_try(() => paymentStatus.statusDetails.indexInProgress) < 2
      || (_try(() => paymentStatus._status === 'cancelled') && !creationNotificationsSent)) {
      return null;
    }
    return (
      <>
        <hr className="m-0" />
        <h2 className="m-0 py-3 d-inline-block">Communications</h2>
        {this.generateCommunicationBadges(creationNotificationsSent, completionNotificationsSent, paymentStatus)}
        <div className="components_overviews_paymentstatus_modules_communications ps-4">
          {this.renderCreationNotificationOverview(creationNotificationsSent, paymentStatus)}
          {this.renderCompletionNotificationOverview(completionNotificationsSent, paymentStatus)}
        </div>
      </>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_paymentstatus_modules_communications);
