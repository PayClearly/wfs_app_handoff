import { connect, Component } from 'component';

// Third Party Imports ...
import { Popover } from 'reactstrap';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  integration: _try(() => Selectors.integrations(state)[props.type]),
  providerTheme: Selectors.providerTheme(state),
});

const mapDispatchToProps = (dispatch, props) => ({
  openIntegrationDetails: (showWarnings) => {
    dispatch(Store.router.openModal('Components.modals.integrationdetail', { type: props.type, showWarnings }));
  },
  navigateTo: (route, routeParams, routeOptions) => {
    dispatch(Store.router.navigateTo(route, routeParams, routeOptions));
  },
});

// eslint-disable-next-line camelcase
class components_widgets_integrationStatus extends Component {
  state = {
    popoverOpen: false,
  };

  cardClicked = () => {
    if (this.props.integration.loading) { return {}; }
    if (this.props.integration.linked) {
      return this.props.openIntegrationDetails();
    }
    return this.setState((prevState) => ({
      popoverOpen: !prevState.popoverOpen,
    }));
  };

  navigateToAccountSettings = (e) => {
    e.preventDefault();
    if (typeof this.props.navigateTo !== 'function') { return; }

    const params = {
      tab: 'account',
    };

    this.props.navigateTo('account', params);
  };

  generatePopoverContents = () => {
    let body;
    const header = `No ${this.props.integration.display}`;
    if (this.props.type === 'erpIntegration') {
      body = `Your ${this.props.providerTheme.displayName} account is not linked with any provider. `
        + `Please visit account settings to link your ${this.props.providerTheme.displayName} account with a `
        + `${this.props.integration.display} provider.`;
    } else {
      body = `Your ${this.props.providerTheme.displayName} account is not linked with any provider. Please `
        + `contact the ${this.props.providerTheme.displayName} Support team to set up this integration.`;
    }
    const color = 'info';
    const action = (
      <div className="mt-1 mb-1 text-center">
        {this.props.type === 'erpIntegration'
          ? (
            <button
              type="button"
              className={`btn btn-${color}`}
              onClick={(e) => { this.navigateToAccountSettings(e); }}
            >
              Go To Settings
            </button>
          ) : null}
      </div>
    );

    return {
      header,
      body,
      color,
      action,
    };
  };

  render() {
    const { integration, type } = this.props;

    const generateStatusDisplay = () => {
      if (integration.linked && Object.keys(integration.errors || {}).some((error) => integration.errors[error])) {
        return (
          <span className="data-container text-danger d-flex align-items-center">
            <h2 className="font-light mb-0 text-truncate">Attention</h2>
            <i className="mdi mdi-sync-off" style={{ fontSize: '30px' }} />
          </span>
        );
      }

      return integration.linked
        ? (
          <span className="data-container text-success d-flex align-items-center">
            <h2 className="font-light mb-0 text-truncate">Connected</h2>
            <i className="mdi mdi-check" style={{ fontSize: '30px' }} />
          </span>
        ) : (
          <span className="data-container text-primary d-flex align-items-center">
            <h2 className="font-light mb-0 text-truncate">Unlinked</h2>
            <i className="mdi mdi-link-variant-off ms-3" style={{ fontSize: '30px' }} />
          </span>
        );
    };

    const alertDetails = this.generatePopoverContents();

    return (
      <div
        className="card widget-small components_widgets_integrationStatus"
        style={{ cursor: 'pointer' }}
        id={`${type}-details`}
        onClick={this.cardClicked}
        role="tooltip"
      >
        <div className="card-body">
          <h5 className="card-title">
            <span className="text-nowrap">
              {integration.display}{integration.linked
                ? null
                : <i className={`mdi mdi-chevron-${this.state.popoverOpen ? 'down' : 'right'}`} />}
            </span>
          </h5>
          {!_try(() => integration.status.fetched)
            && <Components.horizontalLoader />}
          {_try(() => integration.status.fetched) && (
            <div className="text-center">
              {generateStatusDisplay()}
            </div>
          )}
        </div>
        <Popover
          placement={'bottom'}
          isOpen={this.state.popoverOpen}
          target={`${type}-details`}
          toggle={this.cardClicked}
          trigger="legacy"
          className={`popover-override-border widget alert-${alertDetails.color}`}
          innerClassName={`alert alert-${alertDetails.color} mb-0 text-center`}
        >
          <h4 className="alert-heading">{alertDetails.header}</h4>
          {alertDetails.body}
          {alertDetails.action}
        </Popover>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_widgets_integrationStatus);
