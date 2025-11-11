import { connect, Component, bindActionCreators, Fragment } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    checksIntegration: _try(() => Selectors.integrations(state).checksIntegration, {}),
    providerDisplayName: Selectors.providerTheme(state).displayName,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    openLinkModal: (provider) => {
      dispatch(Store.router.openModal('Components.modals.integrationlink', { provider: 'SMARTPAYABLES', type: 'checksIntegration' }));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_integrationcomps_checksIntegration_SMARTPAYABLES_overviews_main extends Component {




  render() {
    const setupRequired = _try(() => this.props.checksIntegration.details.requiresSetup);

    return (
      <div className="components_integrationcomps_checksIntegration_SMARTPAYABLES_overviews_main">
        {setupRequired &&
          <div className="card banner d-flex justify-content-center align-items-center clickable" onClick={() => this.props.openLinkModal()} style={{ height: '2.5rem', border: 'none', textAlign: 'center', margin: '0 auto', backgroundColor: '#e3dffc', color: '#3c327c' }}>
            <p className="m-0 p-0">Additional setup is required to execute Check payments. Click here to complete your setup.</p>
          </div>
        }
        <h2>Smart Payables Details</h2>
        <p style={{ textAlign: 'center' }}>{this.props.providerDisplayName} integrates with Smart Payables to administrate your Check payments. Below you can see your Smart Payables account details.</p>
        <div className="row">
          <div className="col-12">
            <Components.integrationcomps.checksIntegration.SMARTPAYABLES.overviews.account />
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_integrationcomps_checksIntegration_SMARTPAYABLES_overviews_main);


