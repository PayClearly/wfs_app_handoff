import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    cardsIntegration: Selectors.integrations(state).cardsIntegration || {},
    context: Selectors.context(state),
    form: _try(() => state.forms['Components.forms.cardsIntegration.GALILEO'].default, {}),
    providerTheme: Selectors.providerTheme(state),
    kyc: _try(() => state.account.kyc),
  });
};

const mapDispatchToProps = (dispatch) => {
  return ({
    link: () => {
      dispatch(Store.account.linkIntegration('cardsIntegration', { provider: 'GALILEOSTUB' }));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_integrationsetups_cardsintegration_GALILEOSTUB extends Component {

  state = {
    showCreatedNotification: false,
    passCustomerEnrollment: false,
  };

  componentDidMount() { }
  componentWillUnmount() { }

  onCreate() {
    this.setState({
      showCreatedNotification: true,
    });
  }

  passCustomerEnrollmentStep = () => {
    this.setState({
      passCustomerEnrollment: true,
    });
  }

  render() {
    const cardsIntegrationDetails = _try(() => this.props.cardsIntegration.details, {});
    const cardsIntegrationStatus = _try(() => this.props.cardsIntegration.status, {});

    if (!cardsIntegrationStatus.fetched) return null;

    let renderBody = null;
    if (!_try(() => this.props.cardsIntegration.linked)) {
      renderBody = (
        <Fragment>
          <p>The mock GALILEO integration is used for testing/demoing purposes only</p>
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
      const stepOneStatus = cardsIntegrationDetails.isBusinessEnrolled ? 'done' : 'pending';
      let stepTwoStatus;
      let stepThreeStatus;
      let stepFourStatus;
      if (stepOneStatus === 'done') {
        step = 2;
        stepTwoStatus = (cardsIntegrationDetails.areOwnersEnrolled && this.state.passCustomerEnrollment || cardsIntegrationDetails.UBOExemption) ? 'done' : 'pending';
      }

      if (stepTwoStatus === 'done') {
        step = 3;
        stepThreeStatus = cardsIntegrationDetails.isFundingAccountEnrolled ? 'done' : 'pending';
      }

      if (stepTwoStatus === 'done') {
        step = 3;
        stepThreeStatus = cardsIntegrationDetails.isMasterAccountActive ? 'done' : 'pending';
      }

      if (stepThreeStatus === 'done') {
        step = 4;
        stepFourStatus = cardsIntegrationDetails.fundingProvider ? 'done' : 'pending';
      }

      renderBody = (
        <Fragment>
          <Components.cards.wizard>
            <Components.step
              first
              description={'Enroll Business'}
              label={'step 1'}
              done={step > 1}
              current={step === 1}
              disabled={step < 1}
            >
              <Fragment>
                {stepOneStatus === 'pending' && <Components.integrationcomps.cardsIntegration.GALILEO.creators.businessEnrollment provider={this.props.provider} />}
                {stepOneStatus === 'done' &&
                  <Fragment>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="alert alert-success" role="alert">
                          <h4 className="alert-heading">Business Enrollment was Successful</h4>
                          The business has passed verification.
                        </div>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-12">
                        {/* This will be a button to continue enrollment steps
                      <Components.button />
                      */}
                      </div>
                    </div>
                  </Fragment>
                }
              </Fragment>
            </Components.step>
            <Components.step
              description={'Enroll Users'}
              label={'step 2'}
              done={step > 2}
              current={step === 2}
              disabled={step < 2}
            >
              <Fragment>

                {stepTwoStatus === 'pending' &&
                  <Components.integrationcomps.cardsIntegration.GALILEO.comps.customerEnrollment
                    provider={this.props.provider}
                    passStep={this.passCustomerEnrollmentStep}
                  />
                }
                {stepTwoStatus === 'done' &&
                  <div className="row">
                    <div className="col-md-12">
                      <div className="alert alert-success" role="alert">
                        <h4 className="alert-heading">User Enrollment Successful</h4>
                        The users have been successfully verified.
                      </div>
                    </div>
                  </div>
                }
              </Fragment>
            </Components.step>
            <Components.step
              description={'Enroll ACH'}
              label={'step 3'}
              done={step > 3}
              current={step === 3}
              disabled={step < 3}
              last
            >
              <Fragment>
                {stepThreeStatus === 'pending' &&
                  <Components.integrationcomps.cardsIntegration.GALILEO.comps.achEnrollment />}
                {stepThreeStatus === 'done' &&
                  <div className="row">
                    <div className="col-md-12">
                      <div className="alert alert-success" role="alert">
                        <h4 className="alert-heading">ACH Enrollment Successful</h4>
                        Funding Account has been successfully linked.
                      </div>
                    </div>
                  </div>
                }
              </Fragment>
            </Components.step>
            <Components.step
              description={'Funding Provider'}
              label={'step 4'}
              done={step > 4}
              current={step === 4}
              disabled={step < 4}
              last
            >
              <Fragment>
                {stepFourStatus === 'pending' &&
                  <Components.integrationcomps.cardsIntegration.GALILEO.creators.fundingProvider provider={this.props.provider} />
                }
                {stepFourStatus === 'done' &&
                  <div className="row">
                    <div className="col-md-12">
                      <div className="alert alert-success" role="alert">
                        <h4 className="alert-heading">Funding Provider Added</h4>
                        Funding provider has been successfully added.
                      </div>
                    </div>
                  </div>
                }
              </Fragment>
            </Components.step>
          </Components.cards.wizard>
          {this.props.cardsIntegration.linked && !this.props.cardsIntegration.requiresSetup &&
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
      <div className="components_integrationsetups_cardsintegration_GALILEO card-body">
        {renderBody}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationsetups_cardsintegration_GALILEOSTUB);


