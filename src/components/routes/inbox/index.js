import { connect, Component, bindActionCreators, Fragment } from 'component';

// Third Party Imports ...

import Store from 'store';
import Components from 'components';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    tab: state.router.route.params.tab,
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    setTabInRoute: (tab) => {
      dispatch(Store.router.setQueryParams({ tab }));
    },
  });
};

class components_routes_inbox extends Component {




  tabSelected(tab) {
    this.props.setTabInRoute(tab);
  }

  // TODO permissions

  render() {
    const tabs = [
      <Components.tab name="inbox" label="Inbox" iconClassName="mdi-inbox">
        <Components.tables.inbox />
      </Components.tab>,
    ];
    return (
      <Components.cardsroute>
        <div className="components_routes_inbox row">
          <div className="col-12">
            <Components.title />
            <Components.tabs defaultTab={this.props.tab} setTabInRoute={tab => this.tabSelected(tab)}>
              {tabs}
            </Components.tabs>
          </div>
        </div>
      </Components.cardsroute>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_routes_inbox);


