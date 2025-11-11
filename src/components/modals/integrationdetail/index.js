import { connect, Component } from 'component';

// Third Party Imports ...

import Utils from 'utils';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => ({
  integration: _try(() => Selectors.integrations(state)[props.type]),
  organization: state.organization.data.id,
  account: state.account.data.id,
  providerId: state.account.cardsIntegration.data.details.providerId,
  appName: state.appConfig.data.metadata.name,
});

const mapDispatchToProps = (dispatch, props) => ({});

class components_modals_integrationdetail extends Component {





  render() {
    const {
      integration,
      type,
      providerId,
      options,
    } = this.props;

    const ProviderEntityComp = _try(() => PROVIDER_ENTITIES[type][integration.provider]());

    return (
      <div className="modal-dialog components_modals_integrationdetail wide-modal wide-70">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title" id="exampleModalLabel">{integration.display} Details</h2>
            <button onClick={this.props.close} type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-12 col-md-6">
                {integration.linked
                  && (
                    <div className="d-flex align-items-center">
                      <i className="mdi text-success mdi-check mdi-36px" />
                      <h4 className="my-0 ms-1">Linked {this.props.appName !== 'wfs' && `with ${integration.providerInfo.name}`}</h4>
                    </div>
                  )}
                {integration.notLinked
                  && (
                    <div className="d-flex align-items-center">
                      <i className="mdi text-danger mdi-close mdi-36px" />
                      <h4 className="my-0 ms-1">Failed to link{_try(() => integration.providerInfo.name) ? ` with ${integration.providerInfo.name}` : ''}</h4>
                    </div>
                  )}
                {integration.lastUpdated
                  && (
                    <div className="d-flex align-items-center">
                      <i className="mdi text-success mdi-clock mdi-36px" />
                      <h4 className="my-0 ms-1">Last Updated: {Utils.dates.dateToDay(integration.lastUpdated)}</h4>
                    </div>
                  )}
              </div>
              <div className="col-12 col-md-6">
                {Object.keys(integration.errors).every((error) => !integration.errors[error])
                  && (
                    <div>
                      <div className="d-flex align-items-center">
                        <i className="mdi text-success mdi-check mdi-36px" />
                        <h4 className="my-0 ms-1">Ready</h4>
                      </div>
                      {!!providerId
                        && (
                          <div className="d-flex align-items-center">
                            <i className="me-2 text mdi mdi-bank" />
                            <h4 className="my-0 ms-1">Master Funding Account PRN: {providerId}</h4>
                          </div>
                        )}
                    </div>
                  )}
                {integration.details.fundingProvider
                  && (
                    <div className="d-flex align-items-center">
                      <i className="mdi text-success mdi-check mdi-36px" />
                      <h4 className="my-0 ms-1">Funding Provider: {integration.details.fundingProvider}</h4>
                    </div>
                  )}
                {Object.keys(integration.errors).some((error) => integration.errors[error])
                  && (
                    <div className="d-flex align-items-center">
                      <i className="mdi text-danger mdi-exclamation mdi-36px" />
                      <h4 className="my-0 ms-1">Not Ready</h4>
                    </div>
                  )}
                {Object.keys(integration.errors || {}).map((error) => {
                  if (!integration.errors[error]) {
                    return null;
                  }

                  let message = 'There was an issue with the integration';
                  if (error === 'errorSyncing') {
                    message = `Connection with integration is having issues: (${JSON.stringify(integration.errors[error])}). You may need to re-link with your provider, or reach out to support for more information`;
                  } else if (error === 'moreInfoNeeded') {
                    message = 'More information is needed to finish link (e.g. preferences)';
                  }

                  return (
                    <div className="alert alert-danger" role="alert">
                      {message}
                    </div>
                  );
                })}
                {this.props.showWarnings && Object.keys(integration.warnings || {}).map((warning) => {
                  if (!integration.warnings[warning]) {
                    return null;
                  }

                  let message = 'There is a warning';
                  if (warning === 'longTimeSinceSync') {
                    message = 'It has been a long time since sync has occurred';
                  } else if (warning === 'queueIsLarge') {
                    message = 'Queue is large, should be handled soon';
                  } else if (warning === 'resourceErrors') {
                    message = 'There are errors on resources in this integration';
                  }

                  return (
                    <div className="alert alert-warning" role="alert">
                      {message}
                    </div>
                  );
                })}
              </div>
            </div>
            <hr />
            <div className="row">
              {Object.keys(integration.possibleResources || {}).map((resource) => {
                let hasOption = false;
                let itemCount = 0;
                let tooltip = `All ${INTEGRATION_RESOURCE_AlIASES[type][resource] || resource}`;
                // * Options are set in the routerconfig, see wfs/routerconfig for example
                // * WKC requires active card count rather than what is provided in metas
                if (resource === 'pCards' && options.onlyActivePlasticCards) {
                  hasOption = true;
                  tooltip = `Active ${INTEGRATION_RESOURCE_AlIASES[type][resource] || resource}`;
                  itemCount = Object.values(integration.data.resources[resource]).reduce((curr, acc) => {
                    if (acc.status === 'cancelled') {
                      return curr;
                    }
                    curr += 1;
                    return curr;
                  }, 0);
                }
                return (
                  <div className="col-3-md col-6 mb-3">
                    <div className="d-flex align-items-center">
                      <i className={`me-2 text ${_try(() => INTEGRATION_RESOURCE_ICONS[type][resource]) || 'mdi mdi-bank'}`} />
                      <Components.tooltip className="d-flex align-items-center">
                        <h4 className="my-0 ms-1">{hasOption ? itemCount : _try(() => integration.data.metas[resource].count, 0)} {INTEGRATION_RESOURCE_AlIASES[type][resource] || resource}</h4>
                        <div>{tooltip}</div>
                      </Components.tooltip>
                    </div>
                  </div>
                );
              })}
              {Object.keys(INTEGRATION_DETAILS_DISPLAY_ICONS[type] || {}).map((resource) => (
                <div className="col-3-md col-6 mb-3">
                  <div className="d-flex align-items-center">
                    <i className={`me-2 text ${_try(() => INTEGRATION_DETAILS_DISPLAY_ICONS[type][resource]) || 'mdi mdi-bank'}`} />
                    <h4 className="my-0 ms-1">{resource}: {_try(() => integration.data.details[resource], 0)} </h4>
                  </div>
                </div>
              ))}
            </div>
            {!!ProviderEntityComp
              && (
                <div className="row">
                  <div className="col-12">
                    <ProviderEntityComp />
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_modals_integrationdetail);

// Internal Helper Functions ...
const INTEGRATION_RESOURCE_ICONS = {
  erpIntegration: {
    accounts: 'mdi mdi-bank',
    vendors: 'mdi mdi-domain',
    categories: 'mdi mdi-group',
    classes: 'mdi mdi-ungroup',
    records: 'mdi mdi-text',
  },
  cardsIntegration: {
    accounts: 'mdi mdi-bank',
    pCards: 'mdi mdi-bank',
    vCards: 'mdi mdi-domain',
    auths: 'mdi mdi-group',
    clears: 'mdi mdi-ungroup',
    declines: 'mdi mdi-text',
  },
  checksIntegration: {
    checks: 'mdi mdi-email-outline',
  },
  fundgingIntegration: {},
  achIntegration: {
    transfers: 'mdi mdi-bank',
  },
  passwordsIntegration: {
    vaults: 'mdi mdi-key',
    vaultItems: 'mdi mdi-key',
  },
};

const INTEGRATION_DETAILS_DISPLAY_ICONS = {
  erpIntegration: {},
  cardsIntegration: {},
  checksIntegration: {},
  fundgingIntegration: {},
  achIntegration: {
    balance: 'mdi mdi-account-cash-outline',
  },
};


const INTEGRATION_RESOURCE_AlIASES = {
  erpIntegration: {},
  cardsIntegration: {
    pCards: 'plastic cards',
    vCards: 'virtual cards',
  },
  checksIntegration: {},
  fundgingIntegration: {},
  achIntegration: {},
  passwordsIntegration: {},
};

const PROVIDER_ENTITIES = {
  achIntegration: {
    DWOLLA: () => Components.integrationcomps.achintegration.DWOLLA.entities.main,
    GALILEO: () => Components.integrationcomps.achintegration.GALILEO.overviews.main,
    STUB: () => Components.integrationcomps.achintegration.GALILEO.overviews.main,
  },
  checksIntegration: {
    SMARTPAYABLES: () => Components.integrationcomps.checksIntegration.SMARTPAYABLES.overviews.main,
    GALILEO: () => Components.integrationcomps.checksIntegration.GALILEO.overviews.main,
    STUB: () => Components.integrationcomps.checksIntegration.GALILEO.overviews.main,
  },
};

