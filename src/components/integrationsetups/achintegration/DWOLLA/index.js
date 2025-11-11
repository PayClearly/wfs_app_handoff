import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    achIntegration: _try(() => Selectors.integrations(state).achIntegration, {}),
    providerTheme: Selectors.providerTheme(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    link: () => {
      dispatch(Store.account.linkIntegration('achIntegration', { provider: 'DWOLLA' }));
    },
    clearStatusErrors: () => {
      dispatch(Store.account.clearErrorsIntegration('achIntegration'));
    },
  });
};

class components_integrationsetups_achintegration_DWOLLA extends Component {

  state = {};


  componentWillUnmount() {
    this.props.clearStatusErrors();
  }

  render() {
    const achIntegrationDetails = _try(() => this.props.achIntegration.details, {});
    const achIntegrationStatus = _try(() => this.props.achIntegration.status, {});

    if (!achIntegrationStatus.fetched) return null;

    if (!this.props.achIntegration.linked) {
      return (
        <div className={'card-body'}>
          <p>By setting up an account with Dwolla you will be able to pay vendors using ACH. If you are unsure what this means or would like more information please contact {this.props.providerTheme.displayName} Support: {this.props.providerTheme.supportEmail}</p>
          <p>View Dwolla's <a target="blank" href="https://www.dwolla.com/legal/tos/">Terms of Service</a></p>
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
        </div>
      );
    }


    const isExemptNonProfit = achIntegrationDetails.isExemptNonProfit;
    let step = isExemptNonProfit === undefined ? 0 : 1;

    const stepOneStatus = achIntegrationDetails.status;
    const stepOneHasDocument = Boolean(achIntegrationDetails.document);
    const stepOneDocumentStatus = stepOneHasDocument && achIntegrationDetails.document.status;

    let stepTwoStatus;
    let stepTwoHasDocument;
    let stepTwoDocumentStatus;

    let stepThreeStatus;
    let stepThreeMicroDepositStatus;

    let stepFourStatus;

    // determine which step we are in
    if (stepOneStatus === 'verified') {
      if (isExemptNonProfit) {
        stepTwoStatus = 'verified';
      } else {
        step = 2;

        stepTwoStatus = achIntegrationDetails.beneficialOwner && achIntegrationDetails.beneficialOwner.status;
        stepTwoHasDocument = Boolean(achIntegrationDetails.beneficialOwner && achIntegrationDetails.beneficialOwner.document);
        stepTwoDocumentStatus = stepTwoHasDocument && achIntegrationDetails.beneficialOwner.document.status;
      }
    }

    if (stepTwoStatus === 'verified') {
      step = 3;

      stepThreeStatus = achIntegrationDetails.fundingSource && achIntegrationDetails.fundingSource.status;
      stepThreeMicroDepositStatus = _try(() => achIntegrationDetails.fundingSource.microDepositStatus);
    }

    if (stepThreeStatus === 'verified') {
      step = 4;

      stepFourStatus = achIntegrationDetails.beneficialOwner.beneficialOwnershipStatus;
    }

    if (stepFourStatus === 'certified') {
      step = 5;
    }

    return (
      <div className={'card-body'}>
        <Components.cards.wizard>
          <Components.step
            description={'Determine exemption status'}
            label={'step 0'}
            first
            done={step > 0}
            current={step === 0}
            disabled={step < 0}
          >
            {(() => {
              if (isExemptNonProfit === false) {
                return (
                  <div className="row">
                    <div className="col-md-12">
                      <div className="alert alert-success" role="alert">
                        <h4 className="alert-heading">Exemption Status: Not exempt</h4>
                        You will be required to provide to provide beneficial own information.
                      </div>
                    </div>
                  </div>
                );
              } else if (isExemptNonProfit === true) {
                return (
                  <div className="row">
                    <div className="col-md-12">
                      <div className="alert alert-success" role="alert">
                        <h4 className="alert-heading">Exemption Status: Exempt Nonprofit</h4>
                        You will not be required to provide to provice beneficial own information.
                      </div>
                    </div>
                  </div>
                );
              }
              return <Components.integrationcomps.achintegration.DWOLLA.creators.declareExemption />;
            })()}
          </Components.step>
          <Components.step
            description={'Create Account'}
            label={'step 1'}
            done={step > 1}
            current={step === 1}
            disabled={step < 1}
          >
            {(() => {
              if (stepOneStatus === 'document') {
                if (stepOneHasDocument) {
                  if (stepOneDocumentStatus === 'reviewed') {
                    const failure = achIntegrationDetails.document.failureReason;
                    if (failure) {
                      if (failure === 'ScanNotReadable') {
                        return (
                          <Fragment>
                            <div className="row">
                              <div className="col-md-12">
                                <div className="alert alert-warning" role="alert">
                                  <h4 className="alert-heading">Document Upload Was Not Readable</h4>
                                  {this.props.providerTheme.displayName} was unable to read your previous document upload. Please upload a copy of your passport, license, ID card, or another form of identification. If you are not a US citizen, you must upload a copy of your passport. Please upload and submit a valid document below.
                                </div>
                              </div>
                            </div>
                            <Components.integrationcomps.achintegration.DWOLLA.creators.document
                              documentContext="business"
                            />
                          </Fragment>
                        );
                      }
                      return (
                        <Fragment>
                          <div className="row">
                            <div className="col-md-12">
                              <div className="alert alert-warning" role="alert">
                                <h4 className="alert-heading">Document Upload Failed</h4>
                                {this.props.providerTheme.displayName} was unable to successfully upload your document. Please upload a copy of your passport, license, ID card, or another form of identification. If you are not a US citizen, you must upload a copy of your passport. Please upload and submit a valid document below.
                              </div>
                            </div>
                          </div>
                          <Components.integrationcomps.achintegration.DWOLLA.creators.document
                            documentContext="business"
                          />
                        </Fragment>
                      );
                    }
                  } else if (stepOneDocumentStatus === 'pending') {
                    return (
                      <div className="row">
                        <div className="col-md-12">
                          <div className="alert alert-primary" role="alert">
                            <h4 className="alert-heading">Document Upload Pending Review</h4>
                            Your document has been succesfully uploaded. It is currently pending review.
                          </div>
                        </div>
                      </div>
                    );
                  }
                }
                return (
                  <Fragment>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="alert alert-primary" role="alert">
                          <h4 className="alert-heading">Additional Documentation Required</h4>
                          {this.props.providerTheme.displayName} additional information in order to verify your account. Please upload a copy of your passport, license, ID card, or another form of identification. If you are not a US citizen, you must upload a copy of your passport. Please upload and submit a valid document below.
                        </div>
                      </div>
                    </div>
                    <h3>Account Details</h3>
                    <Components.integrationcomps.achintegration.DWOLLA.creators.document
                      documentContext="business"
                    />
                  </Fragment>
                );
              } else if (stepOneStatus === 'unverified') {
                return (
                  <div className="row">
                    <div className="col-md-12">
                      <div className="alert alert-primary" role="alert">
                        <h4 className="alert-heading">Account Creation Review In Progress</h4>
                        Your account application has been submitted and is being processed.
                      </div>
                    </div>
                  </div>
                );
              } else if (stepOneStatus === 'verified') {
                return (
                  <Fragment>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="alert alert-success" role="alert">
                          <h4 className="alert-heading">Account Creation Successful</h4>
                          Your account application has been approved by {this.props.providerTheme.displayName}.
                        </div>
                      </div>
                    </div>
                    <Components.integrationcomps.achintegration.DWOLLA.overviews.account data={achIntegrationDetails} />
                  </Fragment>
                );
              } else if (stepOneStatus === 'retry') {
                return (
                  <Fragment>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="alert alert-warning" role="alert">
                          <h4 className="alert-heading">Account Creation Retry</h4>
                          Your first account application was denied because the information provided did not satisfy our verification check. You can make <strong>only ONE additional attempt</strong> by filling out the form below. Be advised that this time you will be required to submit a full 9 digit SSN for the controller. If this attempt also fails the whole process will fail.
                        </div>
                      </div>
                    </div>
                    <Components.integrationcomps.achintegration.DWOLLA.creators.achaccount
                      retry
                    />
                  </Fragment>
                );
              } else if (stepOneStatus === 'suspended') {
                return (
                  <div className="row">
                    <div className="col-md-12">
                      <div className="alert alert-danger" role="alert">
                        <h4 className="alert-heading">Account Suspended</h4>
                        Your account has been suspended, you must contact {this.props.providerTheme.displayName} support at {this.props.providerTheme.supportEmail} or 1-888-333-8541 to resolve this issue.
                      </div>
                    </div>
                  </div>
                );
              }
              return <Components.integrationcomps.achintegration.DWOLLA.creators.achaccount />;
            })()}
          </Components.step>
          <Components.step
            description={'Add Beneficial Owner'}
            label={'step 2'}
            current={step === 2}
            disabled={step < 2 || isExemptNonProfit}
            done={step > 2}
          >
            {(() => {
              if (stepTwoStatus === 'document') {
                if (stepTwoHasDocument) {
                  if (stepTwoDocumentStatus === 'reviewed') {
                    const failure = achIntegrationDetails.beneficialOwner.document.failureReason;
                    if (failure) {
                      if (failure === 'ScanNotReadable') {
                        return (
                          <Fragment>
                            <div className="row">
                              <div className="col-md-12">
                                <div className="alert alert-warning" role="alert">
                                  <h4 className="alert-heading">Document Upload Was Not Readable</h4>
                                  {this.props.providerTheme.displayName} was unable to read your previous document upload. Please upload a copy of your passport, license, ID card, or another form of identification. If you are not a US citizen, you must upload a copy of your passport. Please upload and submit a valid document below.
                                </div>
                              </div>
                            </div>
                            <Components.integrationcomps.achintegration.DWOLLA.creators.document
                              documentContext="beneficialOwner"
                            />
                          </Fragment>
                        );
                      }
                      return (
                        <Fragment>
                          <div className="row">
                            <div className="col-md-12">
                              <div className="alert alert-warning" role="alert">
                                <h4 className="alert-heading">Document Upload Failed</h4>
                                {this.props.providerTheme.displayName} was unable to successfully upload your document. Please upload a copy of your passport, license, ID card, or another form of identification. If you are not a US citizen, you must upload a copy of your passport. Please upload and submit a valid document below.
                              </div>
                            </div>
                          </div>
                          <Components.integrationcomps.achintegration.DWOLLA.creators.document
                            documentContext="beneficialOwner"
                          />
                        </Fragment>
                      );
                    }
                  } else if (stepTwoDocumentStatus === 'pending') {
                    return (
                      <div className="row">
                        <div className="col-md-12">
                          <div className="alert alert-primary" role="alert">
                            <h4 className="alert-heading">Document Upload Pending Review</h4>
                            Your document has been successfully uploaded. It is currently pending review.
                          </div>
                        </div>
                      </div>
                    );
                  }
                }
                return (
                  <Fragment>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="alert alert-primary" role="alert">
                          <h4 className="alert-heading">Additional Documentation Required</h4>
                          {this.props.providerTheme.displayName} needs additional information in order to verify your beneficial owner. Please upload a copy of your passport, license, ID card, or another form of identification. If you are not a US citizen, you must upload a copy of your passport. Please upload and submit a valid document below.
                        </div>
                      </div>
                    </div>
                    <Components.integrationcomps.achintegration.DWOLLA.creators.document
                      documentContext="beneficialOwner"
                    />
                  </Fragment>
                );

              } else if (stepTwoStatus === 'incomplete') {
                return (
                  <Fragment>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="alert alert-warning" role="alert">
                          <h4 className="alert-heading">Beneficial Owner Retry</h4>
                          Your first beneficial owner application was denied because the information provided did not satisfy our verification check. You can make <strong>only ONE additional attempt</strong> by filling out the form below. If this attempt also fails the whole process will fail.
                        </div>
                      </div>
                    </div>
                    <Components.integrationcomps.achintegration.DWOLLA.creators.beneficialowner
                      retry
                    />
                  </Fragment>
                );
              } else if (stepTwoStatus === 'verified') {
                return (
                  <Fragment>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="alert alert-success" role="alert">
                          <h4 className="alert-heading">Beneficial Owner Creation Successful</h4>
                          Your beneficial owner application has been approved.
                        </div>
                      </div>
                    </div>
                    <Components.integrationcomps.achintegration.DWOLLA.overviews.beneficialowner data={achIntegrationDetails.beneficialOwner} />
                  </Fragment>
                );
              } else if (stepTwoStatus === 'unverified') {
                return (
                  <div className="row">
                    <div className="col-md-12">
                      <div className="alert alert-primary" role="alert">
                        <h4 className="alert-heading">Beneficial Owner Creation Review In Process</h4>
                        Your beneficial owner application has been submitted and is being processed for review.
                      </div>
                    </div>
                  </div>
                );
              }
              return <Components.integrationcomps.achintegration.DWOLLA.creators.beneficialowner />;
            })()}
          </Components.step>
          <Components.step
            description={'Add Funding Source'}
            label={'step 3'}
            current={step === 3}
            disabled={step < 3}
            done={step > 3}
          >
            {stepThreeStatus === 'verified' &&
              (
                <Fragment>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="alert alert-success" role="alert">
                        <h4 className="alert-heading">Funding Source Registry Successful</h4>
                        Your funding source has been successfully verified.
                      </div>
                    </div>
                  </div>
                  <Components.integrationcomps.achintegration.DWOLLA.overviews.fundingsource details={achIntegrationDetails} fundingSource={achIntegrationDetails.fundingSource} />
                </Fragment>
              )
            }
            {stepThreeStatus !== 'verified' && !stepThreeMicroDepositStatus && <Components.integrationcomps.achintegration.DWOLLA.comps.addbank />}
            {stepThreeStatus !== 'verified' && stepThreeMicroDepositStatus && <Components.integrationcomps.achintegration.DWOLLA.comps.microDeposits />}
          </Components.step>
          <Components.step
            description={'Certify Ownership'}
            label={'step 4'}
            current={step >= 4}
            disabled={step < 4}
            done={step > 4}
            last
          >
            {(() => {
              if (stepFourStatus === 'certified') {
                return (
                  <Fragment>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="alert alert-success" role="alert">
                          <h4 className="alert-heading">Ownership Certification Successful</h4>
                          Your ownership has been successfully certified.
                        </div>
                      </div>
                    </div>
                  </Fragment>
                );
              }
              return <Components.integrationcomps.achintegration.DWOLLA.creators.certifyownership />;
            })()}
          </Components.step>
        </Components.cards.wizard>
        {this.props.achIntegration.linked && !this.props.achIntegration.requiresSetup &&
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
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationsetups_achintegration_DWOLLA);


