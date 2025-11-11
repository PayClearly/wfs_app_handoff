import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    checksIntegration: _try(() => Selectors.integrations(state).checksIntegration, {}),
    providerTheme: Selectors.providerTheme(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    link: () => {
      dispatch(Store.account.linkIntegration('checksIntegration', { provider: 'SMARTPAYABLES' }));
    },
    clearStatusErrors: () => {
      dispatch(Store.account.clearErrorsIntegration('checksIntegration'));
    },
  });
};

class components_integrationsetups_checksintegration_SMARTPAYABLES extends Component {


  componentWillUnmount() {
    this.props.clearStatusErrors();
  }

  render() {
    const checksIntegrationDetails = _try(() => this.props.checksIntegration.details, {});
    const checksIntegrationStatus = _try(() => this.props.checksIntegration.status, {});

    if (!checksIntegrationStatus.fetched) return null;

    let renderBody = null;
    if (!_try(() => this.props.checksIntegration.linked)) {
      renderBody = (
        <Fragment>
          <p>By setting up an account with Smart Payables you will be able to pay vendors using automated checks. If you are unsure what this means or would like more information please contact {this.props.providerTheme.displayName} Support at {this.props.providerTheme.supportEmail}</p>
          <a
            tabIndex="-1"
            role="button"
            className="btn btn-primary me-1 ms-1"
            style={{ cursor: 'pointer' }}
            onClick={() => this.props.link()}
          >
            <i className="mdi mdi-link pe-1" />
            Continue the Setup Process
          </a>
        </Fragment>
      );
    } else {
      let step = 1;
      const stepOneStatus = checksIntegrationDetails.active && checksIntegrationDetails.confirmed ? 'done' : 'pending';
      let stepTwoStatus;
      let stepThreeStatus;
      if (stepOneStatus === 'done') {
        step = 2;
        stepTwoStatus = checksIntegrationDetails.microDepositVerified ? 'done' : 'pending';
      }

      if (stepTwoStatus === 'done') {
        step = 3;
        stepThreeStatus = checksIntegrationDetails.checkProofApproved ? 'done' : 'pending';
      }

      if (stepThreeStatus === 'done') {
        step = 4;
      }

      renderBody = (
        <Fragment>
          <Components.cards.wizard>
            <Components.step
              first
              description={'Create Check Account'}
              label={'step 1'}
              done={step > 1}
              current={step === 1}
              disabled={step < 1}
            >
              <Fragment>
                {stepOneStatus === 'pending' &&
                  <Components.integrationcomps.checksIntegration.SMARTPAYABLES.creators.account />
                }
                {stepOneStatus === 'done' &&
                  <Fragment>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="alert alert-success" role="alert">
                          <h4 className="alert-heading">Check Account Creation Successful</h4>
                          Your Smart Payables check account has been successfully created.
                        </div>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12">
                        <Components.integrationcomps.checksIntegration.SMARTPAYABLES.overviews.account />
                      </div>
                    </div>
                  </Fragment>
                }
              </Fragment>
            </Components.step>
            <Components.step
              description={'Verify Micro Deposits'}
              label={'step 2'}
              done={step > 2}
              current={step === 2}
              disabled={step < 2}
            >
              <Fragment>
                {stepTwoStatus === 'pending' &&
                  <Components.integrationcomps.checksIntegration.SMARTPAYABLES.comps.microDeposits />
                }
                {stepTwoStatus === 'done' &&
                  <Fragment>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="alert alert-success" role="alert">
                          <h4 className="alert-heading">Micro Deposit Verification Successful</h4>
                          Your Smart Payables micro deposits have been successfully verified.
                        </div>
                      </div>
                    </div>
                  </Fragment>
                }
              </Fragment>
            </Components.step>
            <Components.step
              description={'Approve Check Proofs'}
              label={'step 3'}
              done={step > 3}
              current={step === 3}
              disabled={step < 3}
              last
            >
              <Fragment>
                {stepThreeStatus === 'pending' &&
                  <Components.integrationcomps.checksIntegration.SMARTPAYABLES.comps.checkProofApproval />
                }
                {stepThreeStatus === 'done' &&
                  <Fragment>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="alert alert-success" role="alert">
                          <h4 className="alert-heading">Check Proof Approval Successful</h4>
                          Your Smart Payables check proof has been successfully approved.
                        </div>
                      </div>
                    </div>
                  </Fragment>
                }
              </Fragment>
            </Components.step>
          </Components.cards.wizard>
          {this.props.checksIntegration.linked && !this.props.checksIntegration.requiresSetup &&
            <a
              tabIndex="-1"
              role="button"
              className="btn btn-primary me-1 ms-1"
              style={{ cursor: 'pointer' }}
              onClick={() => this.props.close()}
            >
              <i className="mdi mdi-check pe-1" />
              Setup Complete: Close
            </a>
          }
        </Fragment>
      );
    }
    return (
      <div className="components_integrationsetups_checksintegration_SMARTPAYABLES card-body">
        {renderBody}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationsetups_checksintegration_SMARTPAYABLES);


