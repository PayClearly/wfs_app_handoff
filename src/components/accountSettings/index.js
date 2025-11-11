import { connect, Component } from 'component';

// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state) => ({
  integrations: Selectors.integrations(state),
  erpIntegrationPolicies: Selectors.entity('erpIntegration_idOrganization_idAccount')(state),
  achTransferPolicies: Selectors.entity('achTransfers_idOrganization_idAccount')(state),
});

const mapDispatchToProps = () => ({});

const mapResourcesToProps = () => ({});

class components_accountSettings extends Component {

  render() {
    const {
      integrations,
      config,
      erpIntegrationPolicies,
      achTransferPolicies,
    } = this.props;

    return (
      <div className="components_accountSettings">
        <Components.entities.account
          virtualCardLogo={config.virtualCardLogo}
          title="General Account Information"
        />
        {
          achTransferPolicies.canCreate && config.fundingPreferences && integrations.achFundingSource.linked
          && <Components.featureFlagWrapper featureKey="achFunding">
            <Components.entities.fundingpreferences title="Auto Draft Funding Preferences" />
          </Components.featureFlagWrapper>
        }
        {
          erpIntegrationPolicies.canCreate && config.erpIntegration
          && <Components.featureFlagWrapper featureKey="erpIntegration">
            <Components.entities.integration type="erpIntegration" />
          </Components.featureFlagWrapper>
        }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_accountSettings);


