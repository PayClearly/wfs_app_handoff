import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';


const mapStateToProps = (state, props) => {
  return ({
    forms: state.forms,
    achIntegration: _try(() => Selectors.integrations(state).achIntegration, {}),
    providerTheme: Selectors.providerTheme(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    verifyMicroDeposits: (data) => {
      return dispatch(Store.account.updateIntegration('achIntegration', { type: 'verifyMicroDeposits', data }));
    },
    clearStatusErrors: (data) => {
      return dispatch(Store.account.clearErrorsIntegration('achIntegration'));
    },
    removeFundingSource: () => {
      return dispatch(Store.account.updateIntegration('achIntegration', { type: 'removeFundingSource' }));
    },
    openAreYouSureModal: (data) => { dispatch(Store.router.openModal('Components.modals.areyousure', data)); },
    resetForm: (name, key, fields) => {
      dispatch(Store.forms.reset(name, key, fields));
    },
  });
};

class components_integrationcomps_achintegration_DWOLLA_comps_microDeposits extends Component {
  state = {
    formBlurAll: false,
    error: false,
  };


  componentWillReceiveProps(nextProps = {}) {
    if (_try(() => nextProps.achIntegration.details.fundingSource.microDepositAttempts, 0) > _try(() => this.props.achIntegration.details.fundingSource.microDepositAttempts, 0)) this.setState({ error: 'Wrong amount(s).' });
  }
  componentWillUnmount() {
    this.props.clearStatusErrors();
  }

  verifyMicroDeposits = () => {
    const form = _try(() => this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.verifyMicroDeposits'].default, {}) || {};
    const values = form._values;
    const data = {
      amount1: {
        value: values.amountOne,
        currency: 'USD',
      },
      amount2: {
        value: values.amountTwo,
        currency: 'USD',
      },
    };

    return this.props.verifyMicroDeposits(data);
  }

  render() {
    const achIntegrationDetails = _try(() => this.props.achIntegration.details, {});
    const microDepositStatus = _try(() => achIntegrationDetails.fundingSource.microDepositStatus);
    const updating = _try(() => this.props.achIntegration.status.updating);
    const error = _try(() => this.props.achIntegration.status.updatingError) || this.state.error;
    const form = _try(() => this.props.forms['Components.integrationcomps.achintegration.DWOLLA.forms.verifyMicroDeposits'].default, {}) || {};
    const submitDisabled = form._allInitial || !form._allValid || updating || _try(() => achIntegrationDetails.fundingSource.microDepositAttempts >= 3);
    const formDisabled = updating || _try(() => achIntegrationDetails.fundingSource.microDepositAttempts >= 3);

    const reachedMaxAttempts = microDepositStatus === 'maxAttempts' || _try(() => achIntegrationDetails.fundingSource.microDepositAttempts >= 3);

    return (
      <div className="components_integrationcomps_achintegration_DWOLLA_comps_microDeposits">
        {microDepositStatus === 'initiated' &&
          <div className="row">
            <div className="col-md-12">
              <div className="alert alert-secondary" role="alert">
                <h4 className="alert-heading">Waiting for Deposits</h4>
                <p className="m-0">
                  Two deposits have been submitted to your {_try(() => achIntegrationDetails.fundingSource.name) || 'bank'} account. When complete, please note the amounts and return in order to finish verifying your bank account.
                  <br /><br />
                  Deposits can take several days to clear. If you have not received a deposit after five days please contact our support team at {this.props.providerTheme.supportPhone} or <a href={`mailto:${this.props.providerTheme.supportEmail}`}>{this.props.providerTheme.supportEmail}</a>.
                </p>
                {/* We could add the ability to manually set the microDeposit status to completed in case the webhooks are unreliable */}
              </div>
            </div>
          </div>
        }
        {microDepositStatus === 'completed' && !reachedMaxAttempts &&
          <Fragment>
            <div className="row">
              <div className="col-md-12">
                {_try(() => achIntegrationDetails.fundingSource.microDepositAttempts > 0) ?
                  <div className="alert alert-warning" role="alert">
                    <h4 className="alert-heading">Most Recent Verification Attempt Failed</h4>
                    <p className="m-0">
                      Your most recent attempt to verify your {_try(() => achIntegrationDetails.fundingSource.name) || 'bank'} account failed, please try again. You have a maximum of 3 attempts before the process is locked{_try(() => achIntegrationDetails.fundingSource.microDepositAttempts) ? <strong>{`, you have ${(3 - achIntegrationDetails.fundingSource.microDepositAttempts)} attempts remaining`}</strong> : ''}.
                    </p>
                  </div>
                  :
                  <div className="alert alert-primary" role="alert">
                    <h4 className="alert-heading">Verify Deposits</h4>
                    <p className="m-0">
                      The two deposits sent to your {_try(() => achIntegrationDetails.fundingSource.name) || 'bank'} account have cleared. Please note the amounts and return in order to finish verifying your bank account.
                    </p>
                  </div>
                }
              </div>
            </div>
            <Components.integrationcomps.achintegration.DWOLLA.forms.verifyMicroDeposits blurAll={this.state.formBlurAll} disabled={formDisabled} />
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
        {microDepositStatus === 'failed' &&
          <Fragment>
            <div className="row">
              <div className="col-md-12">
                <div className="alert alert-danger" role="alert">
                  <h4 className="alert-heading">Deposits Failed to Clear</h4>
                  <p className="m-0">
                    The two deposits sent to your {_try(() => achIntegrationDetails.fundingSource.name) || 'bank'} account have failed to clear successfully. To proceed, you will need to remove your current funding source and try again.
                    <br /><br />
                    If you have any questions or concerns please contact our support team at {this.props.providerTheme.supportPhone} or <a href={`mailto:${this.props.providerTheme.supportEmail}`}>{this.props.providerTheme.supportEmail}</a>.
                  </p>
                  <div className="d-flex justify-content-center">
                    <Components.button
                      buttonText="Remove Funding Source"
                      onClick={() => {
                        this.props.openAreYouSureModal({
                          title: 'Remove Funding Source',
                          content: 'Note: This action is required if you wish to proceed with the ACH payments integration setup.',
                          noText: 'No',
                          yesText: 'Yes',
                          onYes: () => {
                            return this.props.removeFundingSource();
                          },
                        });
                      }}
                      updating={updating}
                      ariaLabel="Remove Funding Source"
                      className="btn btn-danger mt-4"
                      icon="mdi mdi-close"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Fragment>
        }
        {microDepositStatus === 'verified' &&
          <div className="row">
            <div className="col-md-12">
              <div className="alert alert-success" role="alert">
                <h4 className="alert-heading">Successfully Verified Deposits</h4>
                <p className="m-0">
                  You have successfully submitted your deposit verification. Please wait while we finalize verification of your funding source.
                </p>
              </div>
            </div>
          </div>
        }
        {reachedMaxAttempts &&
          <Fragment>
            <div className="row">
              <div className="col-md-12">
                <div className="alert alert-danger" role="alert">
                  <h4 className="alert-heading">Deposit Verification Failed</h4>
                  <p className="m-0">
                    You have failed to verify your {_try(() => achIntegrationDetails.fundingSource.name) || 'bank'} account 3 times. You will be unable to verify this funding source at this time. Please see the following instructions on how to proceed.
                    <br /><br />
                    <strong>Retry With Current Funding Source:</strong><br />
                    1. Remove current funding source.<br />
                    2. Wait until 48 hours have passed since the initial addition of the funding source.<br />
                    3. Retry the funding source addition process.<br />
                    4. If using micro-deposits, verify the funding source using the new posted micro-deposit amounts.
                    <br /><br />
                    <strong>Retry With New Funding Source:</strong><br />
                    1. Remove current funding source.<br />
                    2. Follow the prompts to add the new funding source.<br />
                    3. If using micro-deposits, verify the funding source using the posted micro-deposit amounts.
                    <br /><br />
                    If you have any questions or concerns please contact our support team at {this.props.providerTheme.supportPhone} or <a href={`mailto:${this.props.providerTheme.supportEmail}`}>{this.props.providerTheme.supportEmail}</a>.
                  </p>
                  <div className="d-flex justify-content-center">
                    <Components.button
                      buttonText="Remove Funding Source"
                      onClick={() => {
                        this.props.openAreYouSureModal({
                          title: 'Remove Funding Source',
                          content: 'Note: This action is required if you wish to proceed with the ACH payments integration setup.',
                          noText: 'No',
                          yesText: 'Yes',
                          onYes: () => {
                            return this.props.removeFundingSource();
                          },
                        });
                      }}
                      updating={updating}
                      ariaLabel="Remove Funding Source"
                      className="btn btn-danger mt-4"
                      icon="mdi mdi-close"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Fragment>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationcomps_achintegration_DWOLLA_comps_microDeposits);


