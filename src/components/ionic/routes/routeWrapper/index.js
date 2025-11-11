import { connect, Component } from 'component';

import Store from 'store';
import Selectors from 'selectors';
import Components from 'components';

import './index.scss';

const context = require.context('../', true, /\.js$/);
const routes = _importNestedDirectory(context);

const mapStateToProps = (state, props) => ({
    router: state.router,
    tab: state.router.route.params.tab,
    user: state.user,
    userPrivate: state.user.privateMetadata.data.item,
    accounts: state.accounts.data.items,
    access: state.user.access,
    storageKeys: state.device.storage.collections.keys,
    deviceInitialized: state.device.status.initialized,
    oAuthStatus: state.wfs.oAuth.status,
    biometrics: state.device.biometrics,
    wfsStatus: state.wfs.status,
    preferences: state.wfs.preferences.data,
    devicePlatform: state.device.data.platform,
    featureFlags: Selectors.featureFlags(state),
    debugDevice: state.device,
  });

const mapDispatchToProps = (dispatch, props) => ({
    setTabInRoute: (tab) => {
      dispatch(Store.router.setQueryParams({ tab }));
    },
  });

class components_ionic_routes_routeWrapper extends Component {

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
  }

  componentDidUpdate(prevProps) {

    if (this.props.router.route.path !== prevProps.router.route.path) {

      if (this.animation && this.animation.current && this.animation.current.animation) {
        this.animation.current.animation.play();
      }

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

  render() {
    if (!this.props.deviceInitialized) { return null; }

    const Layout = this.props.layout || Components.mainlayout;
    const Login = this.props.login || Components.login;

    const routeName = this.props.router.route && this.props.router.route.name.split('_')[0];
    const noAuthRoutes = this.props.noAuthRoutes || ['error404', 'oauth'];
    const noAuthForRoute = noAuthRoutes.some((item) => item === routeName);

    if (!routeName) { return <Layout />; }
    const Comp = routes[routeName];
    if (noAuthForRoute) { return (<Comp />); }
    const NotAuthedPage = this.props.noAuthed || Components.ionic.notAuthed;
    if (
      this.props.preferences.useBiometrics
      && !this.props.biometrics.data.isAuthed
      && this.props.user.access.data.isLoggedIn
    ) {
      return <NotAuthedPage />;
    }

    if (this.props.storageKeys.includes('payclearly.refresh_token') || this.props.user.access.data.isLoggedIn) {
      return (
        <Layout>
          <Comp toggleFAB={this.props.toggleFAB} />
        </Layout>
      );
    }

    return <Login />;
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_ionic_routes_routeWrapper);

// Internal Helper Functions ...
function _importNestedDirectory(context) {

  return context.keys().reduce(((acc, key) => {
    const name = key.split('/').slice(1, -1).join('.');
    if (!name || name === '.' || !context(key).default) { return acc; } // return if does not match structure
    acc[name] = context(key).default;
    return acc;
  }), {});
}
// GENERATOR_TYPE='component';
