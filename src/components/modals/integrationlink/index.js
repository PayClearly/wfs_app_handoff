import {
  connect, Component,
} from 'component';

// Third Party Imports ...

import Selectors from 'selectors';
import Components from 'components';

const mapStateToProps = (state, props) => ({
  integration: _try(() => Selectors.integrations(state)[props.type]),
  kycError: state.account.kyc.status.creatingError,
  provider: props.provider,
});

const mapDispatchToProps = () => ({});

class components_modals_integrationlink extends Component {

  possibleSetups = {
    erpIntegration: (provider) => {
      switch (provider) {
        case 'STUB':
          return (
            <Components.integrationsetups.erpintegration.STUB
              type="erpIntegration"
              provider="STUB"
              close={this.props.close}
            />
          );
        case 'ADVANTAGE':
          return (
            <Components.integrationsetups.erpintegration.ADVANTAGE
              type="erpIntegration"
              provider="ADVANTAGE"
              close={this.props.close}
            />
          );
        default:
          return (<p>erpIntegration does not have a provider of type {provider}</p>);
      }
    },
    cardsIntegration: (provider) => {
      switch (provider) {
        case 'STUB':
          return (
            <Components.integrationsetups.cardsintegration.STUB
              type="cardsIntegration"
              provider="STUB"
              close={this.props.close}
            />
          );
        case 'EFS':
          return (
            <Components.integrationsetups.cardsintegration.EFS
              type="cardsIntegration"
              provider="STUB"
              close={this.props.close}
            />
          );
        default:
          return (<p>cardsIntegration does not have a provider of type {provider}</p>);
      }
    },
    fundingIntegration: (provider) => {
      switch (provider) {
        case 'STUB':
          return (
            <Components.integrationsetups.fundingintegration.STUB
              type="fundingIntegration"
              provider="STUB"
              close={this.props.close}
            />
          );
        default:
          return (<p>fundingIntegration does not have a provider of type {provider}</p>);
      }
    },
    checksIntegration: (provider) => {
      switch (provider) {
        case 'STUB':
          return (
            <Components.integrationsetups.checksintegration.STUB
              type="checksIntegration"
              provider="STUB"
              close={this.props.close}
            />
          );
        default:
          return (<p>checksIntegration does not have a provider of type {provider}</p>);
      }
    },
    achIntegration: (provider) => {
      switch (provider) {
        case 'STUB':
          return (
            <Components.integrationsetups.achintegration.STUB
              type="achIntegration"
              provider="STUB"
              close={this.props.close}
            />
          );
        default:
          return (<p>achIntegration does not have a provider of type {provider}</p>);
      }
    },
    passwordsIntegration: (provider) => {
      switch (provider) {
        case '_1PASSWORD':
          return (
            <Components.integrationsetups.passwordsIntegration._1PASSWORD
              type="passwordsIntegration"
              provider="_1PASSWORD"
              close={this.props.close}
            />
          );
        case 'STUB':
          return (
            <Components.integrationsetups.passwordsIntegration.STUB
              type="passwordsIntegration"
              provider="STUB"
              close={this.props.close}
            />
          );
        default:
          return (<p>passwordsIntegration does not have a provider of type {provider}</p>);
      }
    },
  };

  componentWillReceiveProps(nextProps) {
    if (
      _try(() => !this.props.integration.linked
        && nextProps.integration.linked
        && !nextProps.integration.requiresSetup)
    ) {
      this.props.close();
    }
  }

  render() {
    const { integration, type, provider } = this.props;

    return (
      <div className="modal-dialog components_modals_integrationlink wide-modal wide-70">
        <div className="modal-content">
          <div className="modal-header">
            <h2
              className="modal-title"
              id="exampleModalLabel"
            >Setup for {integration.possibleProviders[provider].name}
            </h2>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {
              this.props.kycError
              && <pre className="alert alert-danger" role="alert">{this.props.kycError}</pre>
            }
            {_try(() => this.possibleSetups[type](provider))}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_integrationlink);

