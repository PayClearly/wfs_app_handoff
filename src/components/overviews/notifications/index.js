import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    notificationStatuses: state.notificationStatuses,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    fetchAndSyncNotifications: (notificationIds) => {
      dispatch(Store.notificationstatuses.sync(notificationIds));
    },
    clearNotifications: () => {
      dispatch(Store.notificationstatuses.clear());
    },
  });
};

class components_overviews_notifications extends Component {
  componentDidMount() {
    this.props.fetchAndSyncNotifications(this.props.notificationIds);
  }

  componentWillReceiveProps(nextProps = {}) {
    if (this.props.notificationIds !== nextProps.notificationIds) {
      this.props.fetchAndSyncNotifications(nextProps.notificationIds);
    }
  }

  componentWillUnmount() {
    if (this.props.doNotClearNotifications) return;
    this.props.clearNotifications();
  }

  render() {
    if (!Object.keys(this.props.notificationStatuses.data.items || {}).length) return <Components.spinner />;

    const notificationStatuses = this.props.notificationStatuses.data.items;

    // a utility for creating the delivery badges in the paymentStatus overview
    if (typeof this.props.updateDeliveryStatus === 'function' && _try(() => notificationStatuses[this.props.notificationIds[this.props.notificationIds.length - 1]].id) && (notificationStatuses[this.props.notificationIds[this.props.notificationIds.length - 1]].deliveredAt ? 'delivered' : 'notDelivered') !== this.props.deliveryStatus) {
      this.props.updateDeliveryStatus(notificationStatuses[this.props.notificationIds[this.props.notificationIds.length - 1]].deliveredAt ? 'delivered' : 'notDelivered');
    }

    const notificationDetails = this.props.notificationIds.map((notification, index) => {
      if (!notificationStatuses[notification]) {
        return <span />;
      }

      const sentAt = notificationStatuses[notification].sentAt && { date: new Date(notificationStatuses[notification].sentAt) };
      if (sentAt) {
        sentAt.hour = sentAt.date.getHours();
        sentAt.formattedHour = sentAt.hour > 12 ? sentAt.hour - 12 : sentAt.hour;
        sentAt.period = sentAt.hour > 11 ? 'PM' : 'AM';
        sentAt.minutes = sentAt.date.getMinutes();
        sentAt.formattedMinutes = sentAt.minutes < 10 ? `0${sentAt.minutes}` : sentAt.minutes;
        sentAt.seconds = sentAt.date.getSeconds();
        sentAt.formattedSeconds = sentAt.seconds < 10 ? `0${sentAt.seconds}` : sentAt.seconds;

        sentAt.dateString = sentAt.date.toDateString();
        sentAt.timeStamp = `${sentAt.formattedHour}:${sentAt.formattedMinutes}:${sentAt.formattedSeconds} ${sentAt.period}`;
      }

      const deliveredAt = notificationStatuses[notification].deliveredAt && { date: new Date(notificationStatuses[notification].deliveredAt) };
      if (deliveredAt) {
        deliveredAt.hour = deliveredAt.date.getHours();
        deliveredAt.formattedHour = deliveredAt.hour > 12 ? deliveredAt.hour - 12 : deliveredAt.hour;
        deliveredAt.period = deliveredAt.hour > 11 ? 'PM' : 'AM';
        deliveredAt.minutes = deliveredAt.date.getMinutes();
        deliveredAt.formattedMinutes = deliveredAt.minutes < 10 ? `0${deliveredAt.minutes}` : deliveredAt.minutes;
        deliveredAt.seconds = deliveredAt.date.getSeconds();
        deliveredAt.formattedSeconds = deliveredAt.seconds < 10 ? `0${deliveredAt.seconds}` : deliveredAt.seconds;

        deliveredAt.dateString = deliveredAt.date.toDateString();
        deliveredAt.timeStamp = `${deliveredAt.formattedHour}:${deliveredAt.formattedMinutes}:${deliveredAt.formattedSeconds} ${deliveredAt.period}`;
      }

      const openedAt = notificationStatuses[notification].openedAt && { date: new Date(notificationStatuses[notification].openedAt) };
      if (openedAt) {
        openedAt.hour = openedAt.date.getHours();
        openedAt.formattedHour = openedAt.hour > 12 ? openedAt.hour - 12 : openedAt.hour;
        openedAt.period = openedAt.hour > 11 ? 'PM' : 'AM';
        openedAt.minutes = openedAt.date.getMinutes();
        openedAt.formattedMinutes = openedAt.minutes < 10 ? `0${openedAt.minutes}` : openedAt.minutes;
        openedAt.seconds = openedAt.date.getSeconds();
        openedAt.formattedSeconds = openedAt.seconds < 10 ? `0${openedAt.seconds}` : openedAt.seconds;

        openedAt.dateString = openedAt.date.toDateString();
        openedAt.timeStamp = `${openedAt.formattedHour}:${openedAt.formattedMinutes}:${openedAt.formattedSeconds} ${openedAt.period}`;
      }

      const notificationType = notificationStatuses[notification].type;

      return (
        <div className="col-12">
          <h6>Notification {index + 1} of {this.props.notificationIds.length}</h6>
          <div className="row">
            <div className="col-xs-12 col-md-auto">
              <strong>Type</strong>
              <br />
              <p className="text-muted">{notificationType.charAt(0).toUpperCase() + notificationType.slice(1)}</p>
            </div>
            {notificationType === 'email' &&
              <div className="col-xs-12 col-md-auto">
                <strong>Sent From</strong>
                <br />
                <p className="text-muted">{notificationStatuses[notification].from}</p>
              </div>
            }
            <div className="col-xs-12 col-md-auto">
              <strong>Sent To</strong>
              <br />
              <p className="text-muted">{notificationStatuses[notification].to}</p>
            </div>
            <div className="col-xs-12 col-md-auto">
              <strong>Sent&nbsp;</strong><i className={`mdi mdi-${sentAt ? 'check' : 'close'} text-${sentAt ? 'success' : 'danger'}`} />
              <br />
              <p className="text-muted">{sentAt ? `${sentAt.dateString} | ${sentAt.timeStamp}` : 'Not sent yet'}</p>
            </div>
            <div className="col-xs-12 col-md-auto">
              <strong>Delivered&nbsp;</strong><i className={`mdi mdi-${deliveredAt ? 'check' : 'close'} text-${deliveredAt ? 'success' : 'danger'}`} />
              <br />
              <p className="text-muted">{deliveredAt ? `${deliveredAt.dateString} | ${deliveredAt.timeStamp}` : ''}</p>
            </div>
            {notificationType === 'email' &&
              <div className="col-xs-12 col-md-auto">
                <strong>Opened&nbsp;</strong><i className={`mdi mdi-${openedAt ? 'check' : 'close'} text-${openedAt ? 'success' : 'danger'}`} />
                <br />
                <p className="text-muted">{openedAt ? `${openedAt.dateString} | ${openedAt.timeStamp}` : ''}</p>
              </div>
            }
          </div>
        </div>
      );
    });

    return (
      <div className="components_overviews_notifications">
        <div className="row">
          {
            this.props.showLastOnly ?
              notificationDetails[notificationDetails.length - 1 >= 0 ? notificationDetails.length - 1 : 0]
              :
              notificationDetails
          }
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_overviews_notifications);


