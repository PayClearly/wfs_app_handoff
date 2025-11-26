import { connect, Component } from 'component';
import firebase from 'firebase';
import jwtDecode from 'jwt-decode';
import { CSSTransition } from 'react-transition-group';

import Store from 'store';
import Selectors from 'selectors';
import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => ({
    device: state.device.data,
    access: state.user.access,
    termsAccepted: Selectors.termsAccepted(state),
    logo: state.appConfig.data.logo,
    appName: state.appConfig.data.metadata.name,
    modals: state.router.modals,
    providerTheme: Selectors.providerTheme(state),
    userStatus: state.user.status,
    router: state.router,
    wfsOAuthStatus: state.wfs.oAuth.status,
  });

const mapDispatchToProps = (dispatch, props) => ({
    setAccess: (data) => {
      dispatch(Store.user.setAccess(data));
    },
    syncUser: (desiredContext) => {
      dispatch(Store.user.sync({ desiredContext }));
    },
    clearUser: () => {
      dispatch(Store.user.clear());
    },
    logoutUser: (skipAPI) => {
      dispatch(Store.user.logout(skipAPI));
    },
    refreshToken: () => {
      dispatch(Store.user.refreshToken());
    },
    syncValidations: () => {
      dispatch(Store.validations.sync());
    },
    openTermsModal: () => {
      dispatch(Store.router.openModal('Components.modals.termsandconditions', { decline: () => { dispatch(Store.user.logout()); dispatch(Store.router.closeModal()); } }));
    },
    refreshUserWFS: (callback) => dispatch(Store.wfs.refreshToken(callback)),
  });

const mapResourcesToProps = (state, props) => ({
    contentHash: '/server/liveReload',
    session: Resources.currentSession(state, { jwtId: _try(() => state.user.access.data.jwt.jwtId), uid: _try(() => state.user.access.data.uid) }),
  });

class components_rootcontroller extends Component {

  componentDidMount() {
    const mixpanelInterval = setTimeout(() => {
      window._analytics.mixpanel.track('Data Loaded after 30 seconds', { total: window._totalFirebaseDataReceived / 1000000 });
    }, 30000);

    // watch the users login state and update access accordingly
    firebase.auth().onAuthStateChanged((user) => {
      firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
        if (user) {
          return firebase.auth().currentUser.getIdToken().then((t) => {
            const jwt = jwtDecode(t);
            this.props.setAccess({
              isLoggedIn: true, isGuest: false, uid: user.uid, jwt,
            });
            // Mixpanel's identify() method associates all analytics data with a unique id. In this case, the user's email is treated as a unique id.
            window._analytics.mixpanel.identify(user.user_id || '');
            window._analytics.mixpanel.track('Login');
            if (this.props.router.route.params.orgId || this.props.router.route.params.accountId) {
              this.props.syncUser(this.props.router.route.params);
            } else {
              this.props.syncUser();
            }
          });
        }
        window._analytics.mixpanel.track('Logout');
        window._analytics.mixpanel.reset();
        this.props.clearUser();
        this.props.setAccess({ isLoggedIn: false, isGuest: true });
      });
    });
    this.props.syncValidations();
    const checkLoginInterval = setInterval(() => this.checkLogin(), 5000);
    this.setState({ checkLoginInterval, mixpanelInterval });
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.userStatus.initializing && this.props.userStatus.initialized && window._totalFirebaseDataReceived) {
      window._analytics.mixpanel.track('Initial Data Loaded', { total: window._totalFirebaseDataReceived / 1000000 });
    }

    if (this.props.contentHash && this.props.contentHash !== nextProps.contentHash) {
      window.location.reload();
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.checkLoginInterval);
    clearInterval(this.state.mixpanelInterval);
  }

  checkLogin() {
    const loggedIn = _try(() => this.props.access.data.isLoggedIn);
    const updating = _try(() => this.props.access.status.updating);
    const updatingError = _try(() => this.props.access.status.updatingError);
    const tokenExp = _try(() => this.props.session.tokenExp);

    const isTermsModalOpen = this.props.modals.find((modal) => modal.name === 'Components.modals.termsandconditions');

    if (loggedIn) {
      if (_try(() => this.props.session === null)) {
        return this.props.logoutUser(true);
      }
      if (this.props.session && this.props.session.readExp && this.props.session.readExp < Date.now()) {
        return this.props.logoutUser(true);
      }
      if (updatingError) {
        return this.props.logoutUser(true);
      }
      if (this.props.appName !== 'wfs' && !updating && tokenExp && tokenExp < (Date.now() + 30000)) {
        return this.props.refreshToken();
      }
      if (this.props.termsAccepted === false && !!this.props.session && !isTermsModalOpen && !this.props.providerTheme.disableTerms) {
        this.props.openTermsModal();
      }

      if (this.props.appName === 'wfs') {
        const wfsTokenExp = _resolve(this.props.access, 'data.jwt.tokenExp');
        const updating = _resolve(this.props.access, 'status.updating') || _resolve(this.props.wfsOAuthStatus, 'status.updating');
        if (!updating && wfsTokenExp && Date.now() > (wfsTokenExp - 45000)) {
          clearInterval(this.state.checkLoginInterval);
          this.props.refreshUserWFS(() => firebase.auth().currentUser.getIdToken().then((t) => {
              const jwt = jwtDecode(t);
              this.props.setAccess({
                jwt,
              });
            const checkLoginInterval = setInterval(() => this.checkLogin(), 5000);
            this.setState({ checkLoginInterval });
            }));
        }
      }
    }
  }

  render() {
    const { logo } = this.props;
    let loading;
    if (this.props.appName === 'wfs') {
      loading = !_try(() => this.props.access.data.isLoggedIn && this.props.access.data.jwt.jwtId) && !_try(() => this.props.access.data.isGuest);
    } else {
      loading = !_try(() => this.props.access.data.isLoggedIn && this.props.session.jwtId && this.props.session.jwtId === this.props.access.data.jwt.jwtId) && !_try(() => this.props.access.data.isGuest);
    }
    return (
      <div className="components_rootcontroller">

        <CSSTransition
          classNames="root-controller-transitioner"
          in={loading}
          timeout={600}
          unmountOnExit
        >
          <div className="flex-center h-100 w-100">
            <span>
              <img src={logo} alt="loading logo" style={{ maxHeight: 130 }} />
            </span>
          </div>
        </CSSTransition>

        { !loading && this.props.children }
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_rootcontroller);

