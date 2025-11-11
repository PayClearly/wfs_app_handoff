import { connect, Component, Fragment } from 'component';


// Third Party Imports ...
import { CSSTransition } from 'react-transition-group';

import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';
import Resources from 'resources';

import './index.scss';

const context = require.context('../', true, /\.js$/);
const routes = Utils.importNestedDirectory(context);

const mapStateToProps = (state) => ({
    router: state.router,
    tab: state.router.route.params.tab,
    user: state.user,
    userPrivate: state.user.privateMetadata.data.item,
    accounts: state.accounts.data.items,
    routeConfig: Selectors.routeConfig(state),
  });

const mapDispatchToProps = (dispatch) => ({
    setTabInRoute: (tab) => {
      dispatch(Store.router.setQueryParams({ tab }));
    },
  });

const mapResourcesToProps = (state) => ({
    session: Resources.currentSession(state, { jwtId: _try(() => state.user.access.data.jwt.jwtId), uid: _try(() => state.user.access.data.uid) }),
  });
class components_routes_routeWrapper extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showOverlay: true,
      showForgotPassword: false,
    };
    this.handleForgotPassword = this.handleForgotPassword.bind(this);
    this.handleForgotPasswordCancel = this.handleForgotPasswordCancel.bind(this);
  }

  componentDidMount() {
    const { firstName, lastName, email } = this.props.user.profile.data.item;

    // Prevent initial Faker data from being sent to anayltics
    if (this.props.user.access.data.isLoggedIn) {
      const CSR = this.props.user.privileges.data.item.rootLevel && this.props.user.privileges.data.item.rootLevel.administrateGlobalVendors;
      window._analytics.mixpanel.people.set({
        $email: email,
        $first_name: firstName || null,
        $last_name: lastName || null,
        CSR,
      });
    }

    // Prevent 'App Loaded' false positive if user refreshes
    if (window.performance.navigation.type !== 1) {
      window._analytics.mixpanel.track('App Loaded', { route: this.props.router.route.path });
    }

    this.setState({
      showOverlay: false,
    }); 
  }

  componentDidUpdate(prevProps) {
    if (this.props.router.route.path !== prevProps.router.route.path) {
      const accountContext = this.props.accounts[this.props.user.preferences.data.item.accountContext]
        && this.props.accounts[this.props.user.preferences.data.item.accountContext].name;

      window._analytics.mixpanel.track('Page View', {
        email: this.props.user.profile.data.item.email,
        route: this.props.router.route.path,
        accountContext,
      });
    }
  }

  componentWillUnmount() {}

  handleForgotPassword(e) {
    e.preventDefault();
    this.setState({ showForgotPassword: true });
  }

  handleForgotPasswordCancel(e) {
    e.preventDefault();
    this.setState({ showForgotPassword: false });
  }

  tabSelected(tab) {
    this.props.setTabInRoute(tab);
  }

  render() {
    const Layout = this.props.layout || Components.mainlayout;
    const Login = this.props.login || Components.login;

    const routeName = this.props.router.route && this.props.router.route.name.split('_')[0];
    const noAuthRoutes = this.props.noAuthRoutes || ['error404', 'confirmemail', 'resetpassword', 'termsandconditions'];
    const noAuthForRoute = noAuthRoutes.some((item) => item === routeName);

    const showLogin = this.props.user.access.data.isGuest && !noAuthForRoute;
    const jwtId = this.props.user.access.data.jwt && this.props.user.access.data.jwt.jwtId || false;
    const showTwoFactorAuth = this.props.user.access.data.isLoggedIn && this.props.userPrivate.twoFactorAuthVerified && !this.props.session.twoFactorAuthed;

    if (routeName) {
      const Comp = routes[routeName];
      const { tabs, routePermission, routeDataLoaded } = this.props.routeConfig;
      return (
        <CSSTransition
          classNames="route-wrapper-transitioner"
          timeout={600}
          in={!this.state.showOverlay}
        >
          <div className="h-100 w-100">
            {(() => {
              if (showTwoFactorAuth) {
                return (<Login showTwoFactorLogin />);
              }
              if (this.state.showForgotPassword) {
                return (<Components.forgotpassword handleForgotPasswordCancel={this.handleForgotPasswordCancel} />);
              }

              if (showLogin) {
                return (<Login handleForgotPassword={this.handleForgotPassword} />);
              }

              if (!noAuthForRoute) {
                return (
                  <Layout>
                    <Components.cardsroute>
                      { routeDataLoaded
                        ? (
                          <Fragment>
                            {!_try(() => this.props.routeConfig.hideTitle) && <Components.title hideAccountContext={_try(() => this.props.routeConfig.hideAccountContext)} />}
                            {
                            routePermission
                              ? (
                                <Fragment>
                                  {
                                    tabs && tabs.length > 0
                                    && (
                                      <Components.tabs defaultTab={this.props.tab || tabs[0].name} setTabInRoute={(tab) => this.tabSelected(tab)}>
                                        {tabs && tabs.length && tabs.map(({
                                          name, component, icon, label, config, options,
                                        }) => {
                                          const TabComp = Utils.deepdotproperty(Components, component.split('Components.')[1]);
                                          return (
                                            <Components.tab name={name} label={label} iconClassName={icon}>
                                              <TabComp config={config} options={options} />
                                            </Components.tab>
                                          );
                                        })}
                                      </Components.tabs>
                                    )
                                  }
                                  <Comp />
                                </Fragment>
                              )
                              : <Components.invalidpermissions />
                          }
                          </Fragment>
                        )
                        : (
                          <div style={{ height: '80vh' }}>
                            <Components.spinner />
                          </div>
                          )}
                    </Components.cardsroute>
                  </Layout>
                );
              }
              return (<Comp />);
            })()}
          </div>
        </CSSTransition>
      );
    }
    return <Layout />;

  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_routes_routeWrapper);


