import { connect, Component } from 'component';

// Third Party Imports ...
import { Popover } from 'reactstrap';

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  providerDisplayName: Selectors.providerTheme(state).displayName,
});

const mapDispatchToProps = () => ({});

// eslint-disable-next-line camelcase
class components_widgets_paymentsstatus extends Component {

  state = {
    popoverOpen: false,
  };

  _onClickToggleDetails = () => {
    this.setState((prevState) => ({ popoverOpen: !prevState.popoverOpen }));
  };

  navigateToAccountSettings = (e) => {
    e.preventDefault();
    if (typeof this.props.navigateTo !== 'function') { return; }
    const params = { tab: 'payment' };
    this.props.navigateTo('account', params);
  };

  generatePopoverContents = () => {
    let header = 'No Payment Credentials Found';
    let body = `Your ${this.props.providerDisplayName} account is not linked with EFS. Please visit `
      + `account settings to link your ${this.props.providerDisplayName} account with your EFS credentials.`;
    let color = 'info';
    let action = (
      <div className="mt-1 mb-1 text-center">
        <button
          type="button"
          className={`btn btn-${color}`}
          onClick={(e) => { this.navigateToAccountSettings(e); }}
        >Go To Settings
        </button>
      </div>
    );

    if (this.props.paymentsIntegrationStatus.linked) {
      if (this.props.paymentsIntegrationStatus.connected) {
        header = 'All Clear!';
        body = `Your ${this.props.providerDisplayName} account is ready to make payments!`;
        color = 'success';
        action = null;
      } else {
        header = 'Something Went Wrong';
        body = 'We were unable to connect to EFS. Please visit account settings to confirm that '
          + 'your EFS credentials are accurate.';
        color = 'danger';
        action = (
          <div className="mt-1 mb-1 text-center">
            <button
              type="button"
              className={`btn btn-${color}`}
              onClick={(e) => { this.navigateToAccountSettings(e); }}
            >
              Go To Settings
            </button>
          </div>
        );
      }
    }

    return {
      header,
      body,
      color,
      action,
    };
  };

  render() {
    const { paymentsIntegrationStatus } = this.props;
    const loaded = _try(() => paymentsIntegrationStatus);

    const generateStatusDisplay = () => {
      if (!paymentsIntegrationStatus.linked) {
        return (
          <span className="text-primary">
            <i className="mdi mdi-link-variant-off mdi-48px ms-3" />
          </span>
        );
      }

      return paymentsIntegrationStatus.connected
        ? <span className="text-success">
          <i className="mdi mdi-check mdi-48px" />
        </span>
        : <span className="text-danger">
          <i className="mdi mdi-close mdi-48px" />
        </span>;
    };

    const alertDetails = loaded && this.generatePopoverContents();

    return (
      <div
        role="tooltip"
        className="card widget-small components_widgets_paymentsstatus"
        id="payments-status-details"
        onClick={loaded && this._onClickToggleDetails}
      >
        <div className="card-body d-flex align-items-center">
          <div className="d-flex justify-content-between align-items-center">
            <div className="text-start">
              <h4 className="card-title mb-0">Payments Status</h4>
            </div>
            {loaded && (
              <div className="text-center">
                {generateStatusDisplay()}
              </div>
            )}
            {!loaded
              && <Components.horizontalLoader />}
          </div>
        </div>
        {loaded && (
          <Popover
            placement={'bottom'}
            isOpen={this.state.popoverOpen}
            target={'payments-status-details'}
            toggle={this._onClickToggleDetails}
            trigger="legacy"
            className={`popover-override-border widget alert-${alertDetails.color}`}
            innerClassName={`alert alert-${alertDetails.color} mb-0 text-center`}
          >
            <h4 className="alert-heading">{alertDetails.header}</h4>
            {alertDetails.body}
            {alertDetails.action}
          </Popover>
        )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_widgets_paymentsstatus);
