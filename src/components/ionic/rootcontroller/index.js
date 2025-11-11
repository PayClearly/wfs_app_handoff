import { connect, Component } from 'component';


// Third Party Imports ...
import { CreateAnimation, IonSpinner } from '@ionic/react';
import { SplashScreen } from '@capacitor/splash-screen';
import firebase from 'firebase';
import queryString from 'query-string';
import jwtDecode from 'jwt-decode';

// import Utils from 'utils';
import Store from 'store';
import Components from 'components';
import Selectors from 'selectors';
import { App } from '@capacitor/app';

import './index.scss';
import * as device from '../../../store/device';

const mapStateToProps = (state, props) => ({
  device: state.device.data,
  biometrics: state.device.biometrics,
  access: state.user.access,
  roles: state.user.roles,
  termsAccepted: Selectors.termsAccepted(state),
  logo: state.appConfig.data.logo,
  modals: state.router.modals,
  wfsOAuthStatus: state.wfs.oAuth.status,
  context: state.wfs.data.context,
  preferences: state.wfs.preferences,
  storageKeys: state.device.storage.collections.keys,
  storageStatus: state.device.storage.status,
  userInitialized: state.user.status.initialized,
  env: _try(() => (window.GLOBALCERT.projectId === 'payclearly-test' || window.GLOBALCERT.projectId === 'payclearly-staging') && 'DEV' || 'PROD'),
});

const mapDispatchToProps = (dispatch, props) => ({
  setAccess: (data) => dispatch(Store.user.setAccess(data)),
  syncUser: (uid) => dispatch(Store.user.sync({ uid })),
  loginUser: (env, callback) => dispatch(Store.user.oAuthLogin(`wfsapp${env}${window.GLOBALCERT.WFS_TEST_ENV || ''}`, callback)),
  refreshUser: (callback) => dispatch(Store.wfs.refreshToken(callback)),
  clearUser: () => dispatch(Store.user.clear()),
  clearWFS: () => dispatch(Store.wfs.clear()),
  logoutUser: (env) => dispatch(Store.user.oAuthLogout(`wfsapp${env}${window.GLOBALCERT.WFS_TEST_ENV || ''}`)),
  syncValidations: () => dispatch(Store.validations.sync()),
  openTermsModal: () => {
    dispatch(
      Store.router.openModal(
        'Components.modals.termsandconditions',
        {
          decline: () => {
            dispatch(Store.user.logout());
            dispatch(Store.router.closeModal());
          },
        }
      )
    );
  },
  showToast: (message, color = 'warning', dismiss) => {
    device.showToast({
      message,
      duration: 2000,
      color,
      dismiss,
    })(dispatch);
  },
  syncCustomers: () => dispatch(Store.wfs.syncCustomers()),
  exitTo: (to) => {
    dispatch(Store.router.exitTo(to));
  },
  closeBrowser: () => {
    dispatch(Store.device.closeBrowser());
  },
  activeCheck: (data) => {
    dispatch(Store.device.checkIsActive(data));
  },
  logoutUserClear: (env) => {
    dispatch(Store.user.oAuthLogout(`wfsapp${env}${window.GLOBALCERT.WFS_TEST_ENV || ''}`, true));
  },
});

class components_ionic_rootcontroller extends Component {
  componentDidMount() {
    App.addListener('appUrlOpen', async (urlOpen) => {
      if (this.props.access.data.signingOut) { return this.props.logoutUserClear(this.props.env); }
      this.props.closeBrowser();
      const { query } = queryString.parseUrl(urlOpen.url) || {};
      if (!query.code) {
        return null;
      }
      this.props.exitTo(`/?code=${query.code}&state=${query.state}`);
    });
    App.addListener('appStateChange', (state) => {
      this.props.activeCheck(state.isActive);
      if (state.isActive) { SplashScreen.hide(); }
    });
    firebase.auth().onAuthStateChanged(async (user) => {
      // TODO persistence should probably be set to secure storage for mobile
      await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      if (user) {
        // force a refresh of the access token regardless if the token is expired or not
        const jwt = jwtDecode(await firebase.auth().currentUser.getIdToken(true));
        this.props.syncUser(user.uid);
        this.props.setAccess({
          isLoggedIn: true,
          isGuest: false,
          uid: user.uid,
          jwt,
        });
        return this.props.syncValidations();
      }
      // if there is no user and no refresh token, let the routeWrapper make the decision to show the login page and have the user
      // manually sign in.
      if (this.props.storageKeys.includes('payclearly.refresh_token')) { this.props.loginUser(this.props.env); }
    });
    const checkLoginInterval = setInterval(() => this.checkLogin(), 5000);
    this.setState({ checkLoginInterval });
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(nextProps = {}) {
    if (!this.props.wfsOAuthStatus.updatingError && nextProps.wfsOAuthStatus.updatingError) {
      this.props.showToast(
        'There was an issue with maintaining your session, please sign in again.',
        'primary',
        () => this.logoutUser()
      );
    }
    if (!this.props.device.isActive && nextProps.device.isActive) {
      const tokenExp = _resolve(this.props.access, 'data.jwt.tokenExp');
      const loggedIn = _resolve(this.props.access, 'data.isLoggedIn');
      const { userInitialized } = this.props;
      const updating = _resolve(this.props.access, 'status.updating') && _resolve(this.props.wfsOAuthStatus, 'status.updating');
      const biometricsIsAuthed = _resolve(this.props.biometrics, 'data.isAuthed');
      if (biometricsIsAuthed && loggedIn && userInitialized && !updating && tokenExp && Date.now() < (tokenExp - 45000)) {
        this.props.refreshUser(() => {
          firebase.auth().currentUser.getIdToken(true).then((jwt) => {
            const jwtDecoded = jwtDecode(jwt);
            this.props.setAccess({ jwt: jwtDecoded });
            this.props.syncCustomers();
            const checkLoginInterval = setInterval(() => this.checkLogin(), 5000);
            this.setState({ checkLoginInterval });
          });
        });
      }

      if (loggedIn && userInitialized && !updating && tokenExp && Date.now() > (tokenExp)) {
        this.props.showToast('Your session has expired. Please sign in again.', 'primary', () => this.logoutUser());
      } else {
        this.setState({ checkSession: false });
      }
    }
    if (this.props.device.isActive && !nextProps.device.isActive) {
      clearInterval(this.state.checkLoginInterval);
      this.setState({ checkSession: true });
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.checkLoginInterval);
    App.removeAllListeners();
  }

  logoutUser = () => {
    this.props.clearUser();
    this.props.clearWFS();
    this.props.logoutUser(this.props.env);
    this.props.setAccess({ isLoggedIn: false, isGuest: true });
    this.setState({ checkSession: false });
  };

  checkLogin() {
    const tokenExp = _resolve(this.props.access, 'data.jwt.tokenExp');
    const loggedIn = _resolve(this.props.access, 'data.isLoggedIn');
    const { userInitialized } = this.props;
    const updating = _resolve(this.props.access, 'status.updating') && _resolve(this.props.wfsOAuthStatus, 'status.updating');
    if (loggedIn && userInitialized && !updating && tokenExp && Date.now() > (tokenExp - 45000)) {
      // have to clear the interval immediately in case logging the user in takes longer than next tick.
      clearInterval(this.state.checkLoginInterval);
      this.props.refreshUser(() => {
        firebase.auth().currentUser.getIdToken(true).then((jwt) => {
          const jwtDecoded = jwtDecode(jwt);
          this.props.setAccess({ jwt: jwtDecoded });
          this.props.syncCustomers();
          const checkLoginInterval = setInterval(() => this.checkLogin(), 5000);
          this.setState({ checkLoginInterval });
        });
      });
    }
  }

  render() {
    return (
      <div className="components_ionic_rootcontroller">
        <CreateAnimation
          ref={this.animation}
          duration={400}
          iterations={1}
          easing="ease-out"
          fromTo={[{ property: 'opacity', fromValue: '0', toValue: '1' }]}
          play
        >
          <div>
            {this.state && this.state.checkSession ? (
              <>
                <IonSpinner name="crescent" style={{ position: 'absolute', bottom: '35%', left: '48%' }} />
                <Components.ionic.toast />
              </>
            ) : this.props.children}
          </div>
        </CreateAnimation>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(components_ionic_rootcontroller);


