import { connect, Component, Fragment } from 'component';


// import Utils from 'utils';
// import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => ({
  integrations: Selectors.integrations(state),
});

const mapDispatchToProps = (dispatch, props) => ({});

const mapResourcesToProps = (state, props) => ({});

class components_paymentSettings extends Component {





  render() {
    const { config = {}, integrations, options = {} } = this.props;
    const paymentPipelinePreferenceTypes = ['general', 'card'];
    return (
      <div className="components_paymentSettings">
        {
          config.transferSettings
          && <Components.entities.transfersettings className="mb-5" />
        }
        {
          config.fundingPreferences && integrations.achFundingSource.linked
          && <Components.entities.fundingpreferences title="Auto Draft Funding Preferences" />
        }
        {
          config.cardsIntegration
          && (
            <Components.featureFlagWrapper featureKey="cardsIntegration">
              <Components.entities.integration type="cardsIntegration" options={options.cardsIntegration || false} className="mb-5" />
            </Components.featureFlagWrapper>
          )
        }
        {
          config.checksIntegration
          && (
            <Components.featureFlagWrapper featureKey="checksIntegration">
              <Components.entities.integration type="checksIntegration" />
            </Components.featureFlagWrapper>
          )
        }
        {
          config.achIntegration
          && (
            <Components.featureFlagWrapper featureKey="achIntegration">
              <Components.entities.integration type="achIntegration" />
            </Components.featureFlagWrapper>
          )
        }
        {
          config.erpIntegration
          && (
            <Components.featureFlagWrapper featureKey="erpIntegration">
              <Components.entities.integration type="erpIntegration" />
            </Components.featureFlagWrapper>
          )
        }
        {
          config.paymentPipelinePreferences
          && <Components.entities.paymentpipelinepreferences title="Payment Preferences" types={paymentPipelinePreferenceTypes} />
        }
        {
          config.paymentCustomFields
          && <Components.entities.paymentcustomfields title="Account Custom Fields" />
        }
        {
          config.paymentCardCustomFields
          && (
            <Components.featureFlagWrapper featureKey="paymentCards">
              <Components.entities.paymentcardcustomfields title="Purchase Card Fields" />
            </Components.featureFlagWrapper>
          )
        }
        {
          config.customFileParser
          && <Components.entities.customFileParser title="Custom File Parser" />
        }
        {
          config.accountVendorCredentials
          && (
            <Fragment>
              <h3>Vendor Credentials</h3>
              <Components.tables.accountvendorcredentials />
            </Fragment>
          )
        }
        <Components.entities.ftpaccountsettings />
        <Components.entities.sftp />
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_paymentSettings);


