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
    paymentStatusesStatus: state.account.paymentStatuses.status,
    paymentStatuses: state.account.paymentStatuses.data.items,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    clearPaymentStatusesStatusErrors: () => { dispatch(Store.account.clearErrorsPaymentPipelines()); },
    sendEmail: (id, action, data) => { dispatch(Store.account.updatePaymentPipelines([id], action, data)); },
  });
};

class components_modals_resendnotification extends Component {
  state = {
    formKey: 'resendConfirmation',
    blurAll: false,
    emailsSent: false,
  };

  componentDidMount() { }
  componentWillReceiveProps(nextProps) {
    if (this.state.clickedSend && !this.state.emailsSent && this.props.paymentStatusesStatus.updating && !nextProps.paymentStatusesStatus.updating && !nextProps.paymentStatusesStatus.updatingError) {

      this.setState({ emailsSent: true },
        () => {
          setTimeout(() => {
            this.props.close();
          }, 600);
        },
      );
    }

  }

  componentWillUnmount() {
    this.props.clearPaymentStatusesStatusErrors();
  }

  sendEmail = () => {
    const emails = this.props.forms && this.props.forms['Components.forms.sendemail'] && this.props.forms['Components.forms.sendemail'][this.state.formKey] && this.props.forms['Components.forms.sendemail'][this.state.formKey].emails.value || '';
    const data = {
      emailTo: _try(() => emails.split(',')),
    };
    if (!_try(() => data.emailTo.length)) return;

    let action;

    if (this.props.type === 'creation') {
      action = 'resendOnCreationEmail';
    } else if (this.props.type === 'confirmation') {
      action = this.props.paymentStatuses[this.props.id].tracked.onTrackedNotificationsParams ? 'resendConfirmationEmail' : 'sendConfirmationEmail';
    }

    this.props.sendEmail(this.props.id, action, data);
  }

  render() {
    const form = this.props.forms && this.props.forms['Components.forms.sendemail'] && this.props.forms['Components.forms.sendemail'][this.state.formKey || 'default'];
    const vendor = this.props.paymentStatuses[this.props.id].verified.vendor;

    const sending = this.props.paymentStatusesStatus.updating;
    const disableButtons = sending;
    const disableUpload = sending || !form || !form._allValid;
    const error = this.props.paymentStatusesStatus.updatingError;

    return (
      <div className="modal-dialog" role="document">
        <div className="modal-content h-100 w-100 components_modals_resendnotification">
          <div className="modal-header">
            <h4 className="modal-title" id="exampleModalLabel">
              {this.props.title || 'Send Email'}
            </h4>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ overflowX: 'scroll', overflowY: 'scroll' }}>
            {!this.state.emailsSent &&
              <Fragment>
                <div className={'row mb-3'}>
                  <div className={'col-12'}>
                    <h5>
                      Please specify the delivery email addresses. Multiple addresses can be inputted, just remember to separate them with commas.
                    </h5>
                    <br />
                    <h5>
                      {`We have defaulted the delivery email to ${vendor && vendor.name ? vendor.name : 'this vendor'}'s rep contact, if one has been set.`}
                    </h5>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <Components.forms.sendemail blurAll={this.state.blurAll} formKey={this.state.formKey} type={this.props.type} vendor={vendor} />
                  </div>
                </div>
                {error &&
                  <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Something Went Wrong</h4>
                    <strong>Error:</strong> {error}
                    <br />
                    Please try again, or contact support.
                  </div>
                }
              </Fragment>
            }
            {this.state.emailsSent &&
              <Fragment>
                <div className={'row mb-3'}>
                  <div className="col-12">
                    <div className="d-flex align-items-center">
                      <i className="mdi text-success mdi-check mdi-36px" />
                      <h4 className="my-0 ms-1">Email Successfully Sent</h4>
                    </div>
                  </div>
                </div>
              </Fragment>
            }
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
              onClick={() => { if (disableButtons) return; this.props.close(); }}
              disabled={disableButtons}
            >
              Close
            </button>
            {!this.state.emailsSent &&
              <Components.button
                className="btn btn-primary"
                buttonText="Send"
                onClick={() => {
                  if (disableButtons || disableUpload) return;
                  // this.props.action();
                  this.setState({ clickedSend: true }, this.sendEmail);
                }}
                onDisabledClick={() => { this.setState({ blurAll: true }); }}
                ariaLabel="Send Email"
                updating={sending}
                disabled={disableButtons || disableUpload}
              />
            }
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_resendnotification);


