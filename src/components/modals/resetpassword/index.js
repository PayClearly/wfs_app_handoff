import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
// import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    authStatus: state.user.access.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    sendResetPasswordEmail: (data = {}) => {
      dispatch(Store.user.resetPasswordRequest(data.email));
    },
  });
};

class components_modals_resetpassword extends Component {

  state = {
    showEmailSentNotification: false,
  }


  componentWillReceiveProps(nextProps) {
    if (this.props.authStatus.updating && !nextProps.authStatus.updating) {
      this.emailSent();
    }
  }


  onSubmit(data) {
    this.props.sendResetPasswordEmail(data);
  }

  emailSent() {
    this.setState({
      showEmailSentNotification: true,
    });
    setTimeout(this.props.close, 2000);
  }

  render() {
    const form = this.props.forms['Components.forms.useremail'] && this.props.forms['Components.forms.useremail'].resetPasswordModal;
    return (
      <div className="modal-dialog components_modals_resetpassword" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">Password Reset Email</h5>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="row mt-3">
              <div className="col-md mb-4" >
                <p>Send a password reset email to the following email address</p>
                <br />
                <Components.forms.useremail
                  formKey="resetPasswordModal"
                  isInModal
                  initialFormData={{
                    email: this.props.email,
                  }}
                />
              </div>
            </div>
            {this.state.showEmailSentNotification &&
              <div className="alert alert-primary" role="alert">
                Reset Password Email Sent to {`${form._values.email}`}
              </div>
            }
            <Components.button
              buttonText="Send Email"
              onClick={() => this.onSubmit(form._values)}
              ariaLabel="Send Email"
              disabled={!form || !form._allValid || this.state.showEmailSentNotification}
              updating={this.props.authStatus.updating}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_resetpassword);


