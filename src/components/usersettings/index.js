import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...
import md5 from 'md5';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    notificationEvents: Selectors.eventDefinitions(state),
    notificationPreferences: state.account.notificationPreferences,
    notificationInfo: state.user.preferences.data.item,
    organizationId: state.organization.data.id,
    email: state.user.profile.data.item.email,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openRegisterNotificationsModal: () => {
      dispatch(Store.router.openModal('Components.modals.notificationsmethodsetup', {}));
    },
    // openToast: (namespace, message) => {
    //   dispatch(Store.router.openToast(namespace, { message }));
    // },
    updatePassword: (currentPassword, newPassword) => {
      return dispatch(Store.user.updatePassword(currentPassword, newPassword));
    },
    clearAccessErrors: () => {
      return dispatch(Store.user.clearAccessErrors());
    },
  });
};

class components_usersettings extends Component {

  constructor(props) {
    super(props);
    this.state = {
      readonly: true,
      currentNotificationMenu: '',
    };
  }

  componentDidMount() { }

  componentWillReceiveProps(nextProps) {
    // if (nextProps.notificationPreferences.status.updated && !nextProps.notificationPreferences.status.updating) {
    //   this.props.openToast('Components.toasts.success', 'Settings Updated!');
    // }
  }

  componentWillUnmount() { }

  handleEditBtnClick = (e) => {
    e.preventDefault();
    this.setState({ readonly: false });
  }

  handleCancelBtnClick = (e) => {
    e.preventDefault();
    this.setState({ readonly: true });
  }

  handleNotificationTopicChoice = (topic) => {
    let res;
    if (topic === this.state.currentNotificationMenu) {
      res = '';
    } else {
      res = topic;
    }
    this.setState({ currentNotificationMenu: res });
  }

  handleOpenModal = () => {
    this.props.openRegisterNotificationsModal();
  }

  render() {
    const { updatePassword, clearAccessErrors } = this.props;
    const enrolledInSMS = _try(() => this.props.notificationInfo.notificationPhone, '');
    const testOrg = md5(this.props.organizationId || '');
    const isTest = md5(this.props.organizationId || '') === 'c9bcc1da93b4dc7d2003b4536d52a8f0';

    return (
      <div className="components_usersettings">
        {this.state.readonly ?
          <div className="row">
            <div className="col-md-12">
              <h2>Password</h2>
              <p>To change your password, you will need to confirm your current password.</p>
              <button href="#editAccount" onClick={this.handleEditBtnClick} className="btn btn-primary">Change Password</button>
            </div>
          </div> :
          <div className="row mt-3">
            <div className="col-md-12">
              <Components.forms.changepassword
                updatePassword={updatePassword}
                clearAccessErrors={clearAccessErrors}
                onClose={this.handleCancelBtnClick}
              />
            </div>
          </div>
        }
        <Components.entities.twofactorauthsettings className="mt-5" />
        {/* {isTest &&
        // Cannot identify which organization this is tied to, and cannot confirm that we do support notifcations
        // Removing to see impact, as Ops is not aware it exists either
          <section className="row mt-3">
            <div className="col-md-12">
              <h2>Notifications</h2>
              <h4>My Devices</h4>
              <div style={{ marginLeft: '1rem' }} className="section-content">
                <div className="row">
                  <i className="mdi mdi-email-outline text-primary" />
                  <span style={{ marginLeft: '.3rem', marginTop: '.45rem' }}>{this.props.email}</span>
                </div>
                <div className="row">
                  <i className="mdi mdi-phone text-primary" />
                  {enrolledInSMS ? (
                    <span style={{ marginLeft: '.3rem', marginTop: '.45rem' }}>{this.props.notificationInfo.notificationPhone}</span>
                  ) : (
                    <span style={{ marginLeft: '.3rem', marginTop: '.45rem' }}>Want to recieve sms notifications? <span role="presentation" style={{ color: '#05AEDD', cursor: 'pointer' }} onClick={this.handleOpenModal}>Click here to enroll!</span></span>
                  )}
                </div>
              </div>
              <div>
                <h4>My Subscriptions</h4>
                <p>I want to see notification preferences for <Components.accountcontext /></p>
                <Components.entities.notificationPreferences
                  events={this.props.notificationEvents}
                />
              </div>
            </div>
          </section>
        } */}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_usersettings);


