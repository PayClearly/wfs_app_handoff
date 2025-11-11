import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    fundingDetails: Selectors.funding(state),
    router: state.router,
    fundingIntegrationPolicies: Selectors.entity('achAccountCredentials_idOrganization_idAccount')(state),
    providerDisplayName: Selectors.providerTheme(state).displayName,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    navigateTo: (routeName, routeParams, routeOptions) => {
      dispatch(Store.router.navigateTo(routeName, routeParams, routeOptions));
    },
  });
};

class components_modals_funding extends Component {
  state = {
    tab: 'details',
    showManualTransferCreatedMessage: false,
    manualCreateClicked: false,
  }

  componentDidMount() { }
  componentWillReceiveProps(nextProps = {}) {
    const depositNeeded = Boolean(_try(() => this.props.fundingDetails.currentTransferPool));
    const depositNeededNow = Boolean(_try(() => nextProps.fundingDetails.currentTransferPool));

    if (depositNeeded && !depositNeededNow && this.state.manualCreateClicked) {
      this.setState({ showManualTransferCreatedMessage: true, manualCreateClicked: false }, () => {
        setTimeout(() => {
          this.setState({ showManualTransferCreatedMessage: false });
        }, 2000);
      });
    }

  }
  componentWillUnmount() { }

  onCreateClick = () => {
    this.setState({ manualCreateClicked: true });
  }

  generateAutoFundingExplanation = () => {
    const { fundingDetails } = this.props;
    const automaticFundingType = _try(() => fundingDetails.automaticFundingType);

    if (automaticFundingType === 'eod') {
      return (
        <Fragment>
          <h6 className="m-0 d-inline-block">End-Of-Day Funding: </h6>
          <p className="m-0">End-Of-Day funding will automatically create a transfer at the end of the business day, 4:45 PM ET, to fund payments (e.g. any number of payments submitted before 4:45 PM will be funded at 4:45 PM, payments created after the cutoff will be funded the next day).</p>
        </Fragment>
      );
    } else if (automaticFundingType === 'payment') {
      return (
        <Fragment>
          <h6 className="m-0 d-inline-block">Instant Funding: </h6>
          <p className="m-0">Instant funding will automatically create a transfer to fund payments when the payments are submitted (e.g. payments submitted at 9 AM will be funded at 9 AM).</p>
        </Fragment>
      );
    }
  }

  render() {
    const { fundingDetails, fundingIntegrationPolicies } = this.props;

    const fundingAccountLinked = _try(() => fundingDetails.achAccountLinked);
    const depositNeeded = Boolean(_try(() => fundingDetails.currentTransferPool));
    const autoFundingEnabled = _try(() => fundingDetails.automaticFundingEnabled);

    return (
      <div className="modal-dialog wide-modal wide-80" role="document">
        <div className="modal-content components_modals_funding">
          <div className="modal-header">
            <h3 className="modal-title" id="exampleModalLabel">Funding Details</h3>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="row mb-3">
              <div className="col-12">
                <Components.funding.deposits hideActions inModal />
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                {this.state.showManualTransferCreatedMessage &&
                  <div className="row mb-2">
                    <div className="col-12">
                      <div className="alert alert-success">
                        Deposit Transfer successfully created!
                      </div>
                    </div>
                  </div>
                }
                {!fundingAccountLinked &&
                  <div className="row mb-2">
                    <div className="col-12">
                      <div className="alert alert-info">
                        <p>{depositNeeded ? 'Funds are needed but t' : 'T'}his account has not been configured with {`${this.props.providerDisplayName}`} funding tools. Please update your settings to facilitate funding transfers for this account.</p>
                        {fundingIntegrationPolicies.canCreate &&
                          <button
                            className="btn btn-info"
                            onClick={() => {
                              this.props.navigateTo('account', { tab: 'payment' });
                              this.props.close();
                            }}
                          >
                            Configure Funding
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                }
                {!depositNeeded && fundingAccountLinked &&
                  <div className="row mb-3">
                    <div className="col-12">
                      <div className="alert alert-primary mb-0">
                        <h4 className="alert-heading">Account funding is up to date!</h4>
                        No details to display. You may review current and past funding transfers in the funding history, change funding settings, or create additional payments.
                      </div>
                    </div>
                  </div>
                }
                {depositNeeded &&
                  <Fragment>
                    <div className="row mb-3">
                      <div className="col-12">
                        <Components.fundingExplanation />
                      </div>
                    </div>
                    {fundingAccountLinked && autoFundingEnabled &&
                      <Fragment>
                        <h4>Automatic Funding Information</h4>
                        <div className="row mb-3">
                          <div className="col-12">
                            {this.generateAutoFundingExplanation()}
                          </div>
                        </div>
                      </Fragment>
                    }
                  </Fragment>
                }
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              onClick={this.props.close}
              className="btn btn-secondary"
              type="button"
              aria-label="close button"
              disabled={false}
            >Close</button>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_funding);


