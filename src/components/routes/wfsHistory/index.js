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
    accountStatus: state.accounts.status,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    setTabInRoute: (tab) => {
      return dispatch(Store.router.setQueryParams({ tab }));
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_routes_wfsHistory extends Component {




  tabSelected = (tab) => {
    this.props.setTabInRoute(tab);
  }

  filterTabs = (tabs) => {
    return tabs.filter((tab) => {
      return tab.props.isValidTab;
    });
  }

  render() {
    if (!this.props.accountStatus.fetched) return <Components.spinner />;

    if (this.props.privileges.canAudit) {
      const tabs = [
        <Components.tab name="plasticCards" label="Plastic Cards" iconClassName="mdi-credit-card-multiple-outline" isValidTab >
          <Components.tables.plasticcards />
        </Components.tab>,

        <Components.tab name="transactionHistory" label="Transaction History" iconClassName="mdi-history" isValidTab >
          <Components.tables.virtualcardtransactionhistory />
        </Components.tab>,
      ];

      const filteredTabs = this.filterTabs(tabs);

      return (
        <Components.cardsroute>
          <Components.title />
          {filteredTabs.length ?
            <Components.tabs defaultTab={this.props.tab} setTabInRoute={this.tabSelected} >
              {filteredTabs}
            </Components.tabs>
            :
            <Components.invalidpermissions />
          }
        </Components.cardsroute>
      );
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_routes_wfsHistory);


