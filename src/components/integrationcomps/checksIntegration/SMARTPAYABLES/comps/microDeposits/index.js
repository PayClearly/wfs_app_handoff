import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    checksIntegration: _try(() => Selectors.integrations(state).checksIntegration, {}),
    providerTheme: Selectors.providerTheme(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    verifyMicroDeposits: (data) => {
      return dispatch(Store.account.updateIntegration('checksIntegration', { type: 'verifyMicroDeposits', data }));
    },
    clearStatusErrors: () => {
      return dispatch(Store.account.clearErrorsIntegration('checksIntegration'));
    },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_integrationcomps_checksIntegration_SMARTPAYABLES_comps_microDeposits extends Component {

  state = {
    formName: 'Components.forms.verifymicrodeposits',
    formKey: 'SMARTPAYABLES',
  }


  componentWillReceiveProps(nextProps = {}) {
    if (_try(() => nextProps.checksIntegration.details.microDepositAttempts, 0) > _try(() => this.props.checksIntegration.details.microDepositAttempts, 0)) {
      const attemptsRemaining = 4 - _try(() => nextProps.checksIntegration.details.microDepositAttempts, 0);
      this.setState({ error: `Verification failed. ${attemptsRemaining} attempt(s) remaining.` });
      this.props.resetForm(this.state.formName, this.state.formKey, { amountOne: '', amountTwo: '' });
    }
  }
  componentWillUnmount() {
    this.props.clearStatusErrors();
  }

  verifyMicroDeposits = () => {
    const form = _try(() => this.props.forms[this.state.formName][this.state.formKey], {});
    const values = form._values;
    return this.props.verifyMicroDeposits(values);
  }


  render() {
    const checksIntegrationDetails = _try(() => this.props.checksIntegration.details, {});
    const verificationLocked = _try(() => checksIntegrationDetails.locked);
    const updating = _try(() => this.props.checksIntegration.status.updating);
    const error = _try(() => this.props.checksIntegration.status.updatingError) || this.state.error;
    const form = _try(() => this.props.forms[this.state.formName][this.state.formKey], {});
    const submitDisabled = form._allInitial || !form._allValid || updating || verificationLocked;
    const formDisabled = updating || verificationLocked;
    const attemptsRemaining = 4 - _try(() => checksIntegrationDetails.microDepositAttempts, 0);

    return (
      <div className="components_integrationcomps_checksIntegration_SMARTPAYABLES_comps_microDeposits">
        {!verificationLocked &&
          <Fragment>
            <div className="row">
              <div className="col-12">
                <div className="alert alert-primary" role="alert">
                  <h4 className="alert-heading">Verify Deposits</h4>
                  <p className="m-0">
                    Two deposits have been submitted to the bank account registered in Step 1. Please verify the deposits coming from <strong>RAINY DAY PRINT</strong>.
                    <br /><br />
                    Deposits can take several days to clear. If you have not received a deposit after five days please contact our support team at {this.props.providerTheme.supportPhone} or <a href={`mailto:${this.props.providerTheme.supportEmail}`}>{this.props.providerTheme.supportEmail}</a>.
                  </p>
                </div>
              </div>
              {attemptsRemaining < 4 &&
                <div className="col-12">
                  <div className={`alert alert-${attemptsRemaining < 2 ? 'danger' : 'warning'}`} role="alert">
                    <p className="m-0">
                      You have {attemptsRemaining} verification attempt(s) remaining.
                    </p>
                  </div>
                </div>
              }
            </div>
            <Components.integrationcomps.checksIntegration.SMARTPAYABLES.forms.verifyMicroDeposits blurAll={this.state.formBlurAll} disabled={formDisabled} formKey={this.state.formKey} />
            {error &&
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Something Went Wrong</h4>
                Error: {error}
              </div>
            }
            <Components.button
              disabled={submitDisabled}
              updating={updating}
              onClick={() => {
                this.setState({ error: false });
                this.props.clearStatusErrors();
                this.verifyMicroDeposits();
              }}
              onDisabledClick={() => { this.setState({ formBlurAll: true }); }}
              buttonText="Submit"
            />
          </Fragment>
        }
        {verificationLocked &&
          <Fragment>
            <div className="row">
              <div className="col-md-12">
                <div className="alert alert-danger" role="alert">
                  <h4 className="alert-heading">Deposit Verification Locked</h4>
                  <p className="m-0">
                    Your micro deposit verification has failed too many times and your account has been locked. You will be unable to verify this bank account at this time.
                    <br /><br />
                    Please contact our support team at {this.props.providerTheme.supportPhone} or <a href={`mailto:${this.props.providerTheme.supportEmail}`}>{this.props.providerTheme.supportEmail}</a> for further instruction.
                  </p>
                </div>
              </div>
            </div>
          </Fragment>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationcomps_checksIntegration_SMARTPAYABLES_comps_microDeposits);


