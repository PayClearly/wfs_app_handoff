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
    fetchCheckProofImageForReview: () => {
      return dispatch(Store.account.fetchCheckProofImageForReview());
    },
    approveCheckProof: (data) => {
      return dispatch(Store.account.updateIntegration('checksIntegration', { type: 'approveCheckProof', data }));
    },
    clearStatusErrors: () => {
      return dispatch(Store.account.clearErrorsIntegration('checksIntegration'));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_integrationcomps_checksIntegration_SMARTPAYABLES_comps_checkProofApproval extends Component {

  componentDidMount() {
    this.props.fetchCheckProofImageForReview();
  }

  componentWillUnmount() {
    this.props.clearStatusErrors();
  }

  approveCheckProof = () => {
    const checkProofId = this.props.checksIntegration.data.checkProof.checkProofId;
    return this.props.approveCheckProof({ checkProofId });
  };

  render() {
    const updating = _try(() => this.props.checksIntegration.status.updating);
    const updatingError = _try(() => this.props.checksIntegration.status.updatingError);
    const checkProof = _try(() => this.props.checksIntegration.data.checkProof);
    return (
      <div className="components_integrationcomps_checksIntegration_SMARTPAYABLES_comps_checkProofApproval">
        {checkProof.status === 'fetching' &&
          <Fragment>
            <div className="row">
              <dic className="col-12">
                <div style={{ height: '100px' }}>
                  <Components.horizontalLoader />
                </div>
              </dic>
            </div>
          </Fragment>
        }
        {checkProof.status === 'fetched' &&
          <Fragment>
            <div className="row mb-3">
              <div className="col-12">
                <div className="alert alert-primary" role="alert">
                  <h4 className="alert-heading">Review Check Proof</h4>
                  <p className="m-0">
                    Please review and approve the sample Check Proof image below. Be sure to verify that the information printed is valid, and that the signature is correct.
                    <br /><br />
                    If the image is not satisfactory please contact our support team at {this.props.providerTheme.supportPhone} or <a href={`mailto:${this.props.providerTheme.supportEmail}`}>{this.props.providerTheme.supportEmail}</a>.
                  </p>
                </div>
              </div>
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <img
                      alt="Check Proof Sample"
                      className="card-img-top img-responsive"
                      src={checkProof.image}
                    />
                  </div>
                </div>
              </div>
            </div>
            {updatingError &&
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Something Went Wrong</h4>
                Error: {updatingError}
              </div>
            }
            <Components.button
              updating={updating}
              onClick={() => {
                this.approveCheckProof();
              }}
              buttonText="Approve"
            />
          </Fragment>
        }
        {checkProof.status === 'error' &&
          <Fragment>
            <div className="row">
              {checkProof.error === 'Invalid check proof ID' &&
                <div className="col-12">
                  <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Something Went Wrong</h4>
                    <p className="m-0">
                      There was an issue with getting this account&apos;s sample check proof image.
                      <br /><br />
                      Please contact our support team at {this.props.providerTheme.supportPhone} or <a href={`mailto:${this.props.providerTheme.supportEmail}`}>{this.props.providerTheme.supportEmail}</a>.
                    </p>
                  </div>
                </div>
              }
              {checkProof.error === 'No check proofs available for review' &&
                <div className="col-12">
                  <div className="alert alert-primary" role="alert">
                    <h4 className="alert-heading">Check Proof Review Pending</h4>
                    <p className="m-0">
                      This account&apos;s sample check proof image is not ready for review yet. It may take a few days after a successful micro deposit verification for the sample check proof to be generated. Please check back again later.
                      <br /><br />
                      If you have any questions please contact our support team at {this.props.providerTheme.supportPhone} or <a href={`mailto:${this.props.providerTheme.supportEmail}`}>{this.props.providerTheme.supportEmail}</a>.
                    </p>
                  </div>
                </div>
              }
              {checkProof.error !== 'Invalid check proof ID' && checkProof.error !== 'No check proofs available for review' &&
                <div className="col-12">
                  <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Something Went Wrong</h4>
                    <p className="m-0">
                      Error: {checkProof.error}
                    </p>
                  </div>
                </div>
              }
            </div>
          </Fragment>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationcomps_checksIntegration_SMARTPAYABLES_comps_checkProofApproval);


