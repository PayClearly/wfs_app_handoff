import { connect, Component } from 'component';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    privileges: Selectors.privileges(state),
    tab: state.router.route.params.tab,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    setTabInRoute: (tab) => {
      return dispatch(Store.router.setQueryParams({ tab }));
    },
  });
};

const mapResourcesToProps = (state, props) => { };

class components_routes_wfsAccount extends Component {




  tabSelected(tab) {
    this.props.setTabInRoute(tab);
  }

  render() {
    if (this.props.privileges.canAudit || this.props.privileges.canManageAccountsAndOrganizations) {
      const tabs = [
        <Components.tab name="account" label="Account Settings" iconClassName="mdi-account">
          <Components.entities.account />
        </Components.tab>,

        <Components.tab name="payment" label="Payment Settings" iconClassName="mdi-cash-usd-outline">
          <Components.paymentSettings
            config={{
              transferSettings: false,
              fundingPreferences: false,
              cardsIntegration: true,
              checksIntegration: false,
              achIntegration: false,
              erpIntegration: false,
              paymentPipelinePreferences: false,
              paymentCustomFields: false,
              paymentCardCustomFields: false,
              accountVendorCredentials: false,
            }}
          />
        </Components.tab>,
      ];
      return (
        <Components.cardsroute>
          <Components.title />
          <Components.tabs defaultTab={this.props.tab} onTabSelect={tab => this.tabSelected(tab)}>
            {tabs}
          </Components.tabs>
        </Components.cardsroute>
      );
    }
    return (
      <Components.invalidpermissions />
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_routes_wfsAccount);


