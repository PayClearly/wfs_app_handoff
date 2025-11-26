import {
  connect,
  Component,
  Fragment,
} from 'component';

// Third Party Imports ...

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

const mapStateToProps = (state, props) => ({
  integration: _try(() => Selectors.integrations(state)[props.type]),
  permissions: Selectors.entity(`${props.type}_idOrganization_idAccount`)(state),
  organization: state.organization.data.id,
});

const mapDispatchToProps = (dispatch, props) => ({
  openUnlinkModal: (data) => {
    dispatch(Store.router.openModal('Components.modals.areyousure', data));
  },
  openIntegrationDetails: () => {
    dispatch(Store.router.openModal('Components.modals.integrationdetail', { type: props.type, options: props.options }));
  },
  unlink: () => {
    dispatch(Store.account.unlinkIntegration(props.type));
  },
  openLinkModal: (provider) => {
    dispatch(Store.router.openModal('Components.modals.integrationlink', { provider, type: props.type }));
  },
});

class components_entities_integration extends Component {

  unlink = () => {
    this.props.openUnlinkModal({
      title: `Remove ${this.props.integration.display}`,
      content: `You are about to unlink your ${this.props.integration.providerInfo.name}`,
      noText: 'Cancel',
      yesText: 'Remove Integration',
      onYes: () => this.props.unlink({}),
    });
  };

  viewDetails = () => {
    this.props.openIntegrationDetails(this.props.integration.provider);
  };

  render() {
    if (!this.props.permissions.canRead) { return null; }
    const providerKeys = Object.keys(this.props.integration.possibleProviders).reduce((acc, curr) => {
      if (!this.props.integration.possibleProviders[curr].prod) {
        acc.mock.push(curr);
      } else { acc.prod.push(curr); }
      return acc;
    }, { mock: [], prod: [] });

    const providers = this.props.organization !== 'org-for-testing-policies' ? providerKeys.prod : [...providerKeys.prod, ...providerKeys.mock];

    return (
      <div className="components_entities_integration mb-5">
        <h3>{this.props.integration.display}</h3>
        {this.props.integration && !this.props.integration.loading && this.props.integration.linked
          && <Fragment>
            <p>
              {
                this.props.integration.requiresSetup
                  ? <span className="text">
                    There is still some setup required for {_try(() => this.props.integration.providerInfo.name)}
                  </span>
                  : <span className="text">
                    This account is linked with {_try(() => this.props.integration.providerInfo.name)}
                  </span>
              }
              {
                this.props.integration.requiresSetup
                  ? <a
                    tabIndex="-1"
                    role="button"
                    className="text-primary btn-sm ms-2"
                    style={{ cursor: 'pointer', color: 'white' }}
                    onClick={() => { this.props.openLinkModal(this.props.integration.provider); }}
                  >
                    <i className="mdi mdi-cog pe-1" />
                    Continue setup
                  </a>
                  : <a
                    tabIndex="-1"
                    role="button"
                    className="text-primary btn-sm ms-2"
                    style={{ cursor: 'pointer', color: 'white' }}
                    onClick={() => { this.viewDetails(this.props.integration.provider); }}
                  >
                    <i className="mdi mdi-clipboard-check-outline pe-1" />
                    view details
                  </a>
              }

              {this.props.permissions.canDelete
                && <a
                  tabIndex="-1"
                  role="button"
                  className="text-danger btn-sm ms-2"
                  style={{ cursor: 'pointer', color: 'white' }}
                  onClick={() => { this.unlink(); }}
                >
                  <i className="mdi mdi-link-off pe-1" />
                  unlink account
                </a>}
            </p>
            {this.props.integration.warning
              && <div className="col-12">
                <div className="alert alert-info" role="alert">
                  {this.props.integration.warning.message}
                </div>
              </div>}
            {
              _try(() => !!Object.keys(this.props.integration.possiblePreferences || {}).length)
              && !this.props.integration.requiresSetup
              && <Components.entities.integrationpreferences type={this.props.type} />
            }
          </Fragment>}
        {this.props.integration && !this.props.integration.loading && !this.props.integration.linked
          && <p>
            <div className="text-danger mb-1">
              There is no {this.props.integration.display} provider linked with this account
            </div>
            <br />
            {this.props.permissions.canCreate
              && <span>
                {
                  providers
                    .map((key) => {
                      const provider = this.props.integration.possibleProviders[key];
                      if (this.props.integration.name === 'achIntegration' && key === 'CHANGE_ME_PROVIDER') {
                        return (
                          <Components.featureFlagWrapper featureKey="providerACH">
                            <a
                              tabIndex="-1"
                              role="button"
                              className="btn btn-primary me-1 ms-1"
                              style={{ cursor: 'pointer', color: 'white' }}
                              onClick={() => this.props.openLinkModal(key)}
                            >
                              <i className="mdi mdi-link pe-1" />
                              Link with {provider.name}
                            </a>
                          </Components.featureFlagWrapper>
                        );
                      }
                      if (this.props.integration.name === 'checksIntegration' && key === 'CHANGE_ME_PROVIDER') {
                        return (
                          <Components.featureFlagWrapper featureKey="providerCheck">
                            <a
                              tabIndex="-1"
                              role="button"
                              className="btn btn-primary me-1 ms-1"
                              style={{ cursor: 'pointer', color: 'white' }}
                              onClick={() => this.props.openLinkModal(key)}
                            >
                              <i className="mdi mdi-link pe-1" />
                              Link with {provider.name}
                            </a>
                          </Components.featureFlagWrapper>
                        );
                      }
                      return (
                        <a
                          tabIndex="-1"
                          role="button"
                          className="btn btn-primary me-1 ms-1"
                          style={{ cursor: 'pointer', color: 'white' }}
                          onClick={() => this.props.openLinkModal(key)}
                        >
                          <i className="mdi mdi-link pe-1" />
                          Link with {provider.name}
                        </a>
                      );

                    })
                }
              </span>}
          </p>}
        {(!this.props.integration || this.props.integration.loading)
          && <div className="d-inline-block">
            <Components.horizontalLoader />
          </div>}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_entities_integration);

