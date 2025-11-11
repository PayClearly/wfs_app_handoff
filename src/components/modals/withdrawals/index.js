import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    fundingDetails: Selectors.funding(state),
    router: state.router,
    providerTheme: Selectors.providerTheme(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    navigateTo: (routeName, routeParams, routeOptions) => {
      dispatch(Store.router.navigateTo(routeName, routeParams, routeOptions));
    },
  });
};

class components_modals_withdrawals extends Component {
  state = {
    tab: 'details',
    showManualTransferCreatedMessage: false,
    manualCreateClicked: false,
  }


  componentWillReceiveProps(nextProps = {}) {
    const withdrawalNeeded = Boolean(_try(() => this.props.fundingDetails.currentPendingWithdrawalTotal));
    const withdrawalNeededNow = Boolean(_try(() => nextProps.fundingDetails.currentPendingWithdrawalTotal));

    if (withdrawalNeeded && !withdrawalNeededNow && this.state.manualCreateClicked) {
      this.setState({ showManualTransferCreatedMessage: true, manualCreateClicked: false }, () => {
        setTimeout(() => {
          this.setState({ showManualTransferCreatedMessage: false });
        }, 2000);
      });
    }

  }


  onCreateClick = () => {
    this.setState({ manualCreateClicked: true });
  }

  changeTab = (tab) => {
    this.props.changeModalTab(tab);
  }

  generateAutoFundingExplanation = () => {
    return (
      <Fragment>
        <p className="m-0">When a payment issue (refund, unused funds, etc.) is resolved with a request to withdraw the relevant funds back into the funding account, it generates a pending withdrawal. Each Tuesday at 11:00 AM ET, all pending withdrawals are pooled and submitted as a withdrawal transfer. Funds will then appear in this account's funding account once the transfer is complete. {this.props.providerTheme.displayName} offers expedited withdrawal services, please contact {this.props.providerTheme.displayName} support for more information.</p>
      </Fragment>
    );
  }

  render() {
    const { fundingDetails } = this.props;

    const fundingAccountLinked = _try(() => fundingDetails.achAccountLinked);
    const depositNeeded = Boolean(_try(() => fundingDetails.currentPendingWithdrawalTotal));


    return (
      <div className="modal-dialog wide-modal wide-80" role="document">
        <div className="modal-content components_modals_withdrawals">
          <div className="modal-header">
            <h3 className="modal-title" id="exampleModalLabel">Withdrawal Details</h3>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="row mb-3">
              <div className="col-12">
                <Components.funding.withdrawals hideActions />
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                {!fundingAccountLinked &&
                  // message for how not linked
                  <div className="row mb-2">
                    <div className="col-12">
                      <div className="alert alert-info">
                        <p>{depositNeeded ? 'There are pending withdrawals but t' : 'T'}his account has not been configured with {`${this.props.providerTheme.displayName}`} funding tools. Please update your settings to facilitate funding transfers for this account.</p>
                        <button
                          className="btn btn-info"
                          onClick={() => {
                            this.props.navigateTo('account', { tab: 'payment' });
                            this.props.close();
                          }}
                        >
                          Configure Funding
                        </button>
                      </div>
                    </div>
                  </div>
                }
                {!depositNeeded && fundingAccountLinked &&
                  <div className="row mb-2">
                    <div className="col-12">
                      <div className="alert alert-primary mb-0">
                        <h4 className="alert-heading">No Pending Withdrawals</h4>
                        No details to display. You may review current and past funding transfers in the funding history, change funding settings, or create additional payments.
                      </div>
                    </div>
                  </div>
                }
                {depositNeeded &&
                  <Fragment>
                    <div className="mb-3">
                      <h5 className="mb-0">Resolved Refunds</h5>
                      <p className="m-0 small"><em className="text-muted">Current pending withdrawals eligible for the next withdrawal release</em></p>
                    </div>
                    <div className="row mb-2">
                      <div className="col-12">
                        <Components.tables.resolvedIssues />
                      </div>
                    </div>
                    {fundingAccountLinked &&
                      <Fragment>
                        <div className="mb-3">
                          <h5 className="mb-0">Withdrawals Explanation</h5>
                          <p className="m-0 small"><em className="text-muted">How do withdrawals work?</em></p>
                        </div>
                        {/* Explanation for when funds are going out if applicable */}
                        <div className="row mb-2">
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

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_withdrawals);


