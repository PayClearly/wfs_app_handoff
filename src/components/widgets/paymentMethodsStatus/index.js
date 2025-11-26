import { connect, Component } from 'component';

import { Popover, PopoverHeader, PopoverBody } from 'reactstrap';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => ({
  integrations: _try(() => Selectors.integrations(state)),
});

const mapDispatchToProps = (dispatch) => ({
  openIntegrationDetails: ({ type, showWarnings }) => {
    dispatch(Store.router.openModal('Components.modals.integrationdetail', { type, showWarnings }));
  },
  navigateTo: (route, routeParams, routeOptions) => {
    dispatch(Store.router.navigateTo(route, routeParams, routeOptions));
  },
});

// Internal Helper Functions ...
function _getIntegrationInfo(integration) {
  const res = {};
  if (integration === 'achIntegration') {
    res.name = 'ACH';
    res.icon = 'bank';
  }
  if (integration === 'cardsIntegration') {
    res.name = 'Cards';
    res.icon = 'credit-card-outline';
  }
  if (integration === 'checksIntegration') {
    res.name = 'Checks';
    res.icon = 'email-outline';
  }
  return res;
}

function IntegrationItem({ integration, details, onClick }) {
  const { icon, name } = _getIntegrationInfo(integration);
  const id = `${integration}-methods-status`;
  return (
    <div
      role="tooltip"
      id={id}
      style={{ display: 'grid', gridTemplateColumns: '12.25rem 2rem' }}
      onClick={() => onClick(name, integration)}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', fontSize: '1.25rem' }}
        className="card-title mb-0"
      >
        {name} Integration
      </div>
      <div
        style={{
          fontSize: '2rem',
          color: details.notLinked
            ? '#54667a'
            : '#05AEDD',
          cursor: details.notLinked ? 'auto' : 'pointer',
        }}
      >
        <Components.icon
          alertStyle={{ top: '0' }}
          icon={icon}
          alertIcon="alert-circle"
          alert={_try(() => details.errors.errorSyncing || details.errors.moreInfoNeeded)}
        />
      </div>
    </div>
  );
}

// eslint-disable-next-line camelcase
class components_widgets_paymentMethodsStatus extends Component {

  state = {
    integrations: ['cardsIntegration', 'checksIntegration', 'achIntegration'],
    popoverOpen: false,
    fetched: false,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.integrations.cardsIntegration.status.fetched
      && nextProps.integrations.checksIntegration.status.fetched
      && nextProps.integrations.achIntegration.status.fetched) {
      this.setState({ fetched: true });
    }
  }

  _onClickToggleDetails = () => {
    if (!this.state.fetched) { return; }
    this.setState((prevState) => ({ popoverOpen: !prevState.popoverOpen }));
  };

  integrationClicked = (name, integration) => {
    if (this.props.integrations[integration].linked) {
      this.setState({ popoverOpen: false });
      return this.props.openIntegrationDetails({ type: integration });
    }
  };

  closePopover = () => {
    this.setState({ name: '', popoverOpen: false });
  };

  navigateToAccountSettings = (e) => {
    e.preventDefault();
    this.props.navigateTo('account', { tab: 'payment' });
  };

  render() {
    const generateStatusDisplay = () => {
      const integrations = Object.keys(this.props.integrations || {})
        .filter((integration) => this.state.integrations.includes(integration));

      if (integrations.filter((integration) => Object.keys(this.props.integrations[integration].errors || {})
        .some((error) => this.props.integrations[integration].errors[error])).length) {
        return (
          <span className="data-container text-danger d-flex align-items-center">
            <h2 className="font-light mb-0 text-truncate">Attention</h2>
            <i className="mdi mdi-sync-off " style={{ fontSize: '30px' }} />
          </span>
        );
      } if (integrations.filter((integration) => this.props.integrations[integration].linked).length) {
        return (
          <span className="data-container text-success d-flex align-items-center">
            <h2 className="font-light mb-0 text-truncate">Connected</h2>
            <i className="mdi mdi-check " style={{ fontSize: '30px' }} />
          </span>
        );
      }
      return (
        <span className="data-container text-primary d-flex align-items-center">
          <h2 className="font-light mb-0 text-truncate">Unlinked</h2>
          <i className="mdi mdi-link-variant-off  ms-3" style={{ fontSize: '30px' }} />
        </span>
      );
    };

    return (
      <div
        className="card widget-small components_widgets_paymentMethodsStatus"
        id="integration-status-widget"
        style={{ cursor: 'pointer' }}
        role="tooltip"
        onBlur={() => this.setState({ popoverOpen: false })}
      >
        <div className="card-body align-items-center" onClick={this._onClickToggleDetails}>
          <h5 className="card-title">Payment
            <span className="text-nowrap">Integrations
              <i className={`mdi mdi-chevron-${this.state.popoverOpen ? 'down' : 'right'}`} />
            </span>
          </h5>
          {this.state.fetched
            ? (
              <div className="text-center">
                {generateStatusDisplay()}
              </div>
            )
            : <Components.horizontalLoader />}
        </div>
        <Popover
          placement={'bottom'}
          toggle={this._onClickToggleDetails}
          isOpen={this.state.popoverOpen}
          target={'integration-status-widget'}
          trigger="legacy"
          className="pending-popover-override"
        >
          <PopoverHeader className="popover-header-override">
            <div className="d-flex justify-content-between align-items-center">
              <div className="me-2">
                Integration Details
              </div>
              <div>
                <i className="mdi mdi-close close" role="tooltip" onClick={this._onClickToggleDetails} />
              </div>
            </div>
          </PopoverHeader>
          <PopoverBody>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                {this.state.integrations.map((integration) => (
                  <IntegrationItem
                    key={integration}
                    integration={integration}
                    details={this.props.integrations[integration]}
                    onClick={this.integrationClicked}
                  />
                ))}
              </div>
            </div>
          </PopoverBody>
        </Popover>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_widgets_paymentMethodsStatus);
