import { connect, Component, bindActionCreators, Fragment } from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state) => {
  return ({
    integration: _try(() => Selectors.integrations(state).achIntegration, {}),
    providerTheme: Selectors.providerTheme(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openModal: () => {
      dispatch(Store.router.openModal('Components.modals.termsandconditions', { static: true }));
    },
    openLinkModal: (provider) => {
      dispatch(Store.router.openModal('Components.modals.integrationlink', { provider: 'DWOLLA', type: 'achIntegration' }));
    },
  });
};

class components_integrationcomps_achintegration_DWOLLA_entities_main extends Component {

  componentDidMount() { }
  componentWillUnmount() { }

  render() {

    const { details } = this.props.integration;

    const { beneficialOwner, fundingSource } = details;
    const setupRequired = _try(() => details.requiresSetup);

    return (
      <div className="components_integrationcomps_achintegration_DWOLLA_entities_main">
        {setupRequired &&
          <div className="card banner d-flex justify-content-center align-items-center clickable" onClick={() => this.props.openLinkModal()} style={{ height: '2.5rem', border: 'none', textAlign: 'center', margin: '0 auto', backgroundColor: '#e3dffc', color: '#3c327c' }}>
            <p className="m-0 p-0">Additional setup is required to execute ACH payments. Click here to complete your setup.</p>
          </div>
        }
        <h2>Dwolla Details</h2>
        <p style={{ textAlign: 'center' }}>{this.props.providerTheme.displayName} integrates with Dwolla to administrate your ACH payments. Below you can see your Dwolla account details.</p>
        <div className="row mb-3">
          <div className="pr-md-1 col-md-6 mb-3 mb-md-0">
            <Components.integrationcomps.achintegration.DWOLLA.overviews.account data={details} />
          </div>
          <div className="pl-md-1 col-md-6">
            <Components.integrationcomps.achintegration.DWOLLA.overviews.beneficialowner data={beneficialOwner} />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <Components.integrationcomps.achintegration.DWOLLA.overviews.fundingsource fundingSource={fundingSource} details={details} />
          </div>
        </div>
        <p style={{ fontSize: '.85rem', textAlign: 'center' }}>You can <a style={{ color: '#05AEDD', cursor: 'pointer' }} onClick={() => window.open('https://www.dwolla.com/legal/tos/', 'Dwolla TOS', "height=1200,width=800")}>click here to view Dwolla's Terms and Conditions</a>, or you can <span style={{ color: '#05AEDD', cursor: 'pointer' }} onClick={() => this.props.openModal()}>click here to view {this.props.providerTheme.displayNamePlural}</span>.</p>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_integrationcomps_achintegration_DWOLLA_entities_main);


