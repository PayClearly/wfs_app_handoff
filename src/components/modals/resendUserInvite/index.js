import React, { Component } from 'react';
import { connect } from 'react-redux';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

const mapStateToProps = (state, props) => {
  return ({
    inviteStatus: state.users.status,
    user: _try(() => state.users.data.items[props.id]),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    resendUserInvite: (email) => {
      dispatch(Store.users.resendUserInvite(email));
    },
  });
};

class components_modals_resendUserInvite extends Component {

  state = {
    inviteSent: false,
    onTheWayNotificationDelivered: null,
    completionNotificationsDelivered: null,
    showPastInvites: false,
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.inviteStatus.updating && !nextProps.inviteStatus.updating) {
      this.inviteSent();
    }
  }

  onYes() {
    this.props.resendUserInvite(this.props.user.email);
  }

  onNo() {
    this.props.close();
  }

  setCompletionNotificationsDelivered = (delivered) => {
    this.setState({ completionNotificationsDelivered: delivered });
  }

  setonTheWayNotificationsDelivered = (delivered) => {
    this.setState({ onTheWayNotificationDelivered: delivered });
  }

  handleShowPastInvites = () => {
    this.setState(prevState => ({
      showPastInvites: true,
    }));
  }

  inviteSent() {
    this.setState({
      inviteSent: true,
    });
  }
  render() {
    const { inviteSent, showPastInvites } = this.state;
    const notifications = _try(() => this.props.user.notificationsSent);

    return (
      <div className="modal-dialog components_modals_removeroles" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">Resend User Invite</h5>
            <button onClick={() => this.onNo()} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="row mt-3">
              <div className="col-md mb-4" >
                <h3> Are you sure you want to do this? </h3>
                <p>You are about to resend an invite to {this.props.user.email}.</p>
                <br />
                {showPastInvites && notifications &&
                  <Components.overviews.notifications
                    notificationIds={notifications}
                    updateDeliveryStatus={this.setCompletionNotificationsDelivered}
                    deliveryStatus={this.state.completionNotificationsDelivered}
                  />
                }
                {inviteSent &&
                  <div className="alert alert-primary" role="alert">
                    Invite has been sent to {`${this.props.user.email}`}
                  </div>
                }

                <div className="row float-end mt-4 mb-4">
                  <button
                    onClick={() => { this.handleShowPastInvites(); }}
                    className="btn btn-danger me-3"
                    type="button"
                    aria-label="show past invites button"
                    disabled={!notifications}
                  >Show Past Invites</button>
                  <Components.button
                    onClick={() => { this.onYes(); }}
                    className="btn btn-danger me-3"
                    type="button"
                    aria-label="resend invite button"
                    disabled={false}
                    buttonText="Resend Invite"
                    updating={this.props.inviteStatus.updating}
                  />
                  <button
                    onClick={() => { this.onNo(); }}
                    className="btn btn-secondary me-4"
                    type="button"
                    aria-label="cancel button"
                    disabled={false}
                  >Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_resendUserInvite);

