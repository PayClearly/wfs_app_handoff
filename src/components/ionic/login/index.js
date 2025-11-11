import {
  connect,
  Component,
} from 'component';
import {
  IonPage,
  IonButton,
  IonImg,
  IonSpinner,
  CreateAnimation,
} from '@ionic/react';

import Store from 'store';

import globe from './globe.svg';
import './index.scss';

const mapStateToProps = (state, props) => ({
  access: state.user.access,
  code: state.router.route.params.code,
  state: state.router.route.params.state,
  env: _try(() => (window.GLOBALCERT.projectId === 'TEST-ENV_CHANGE-ME' || window.GLOBALCERT.projectId === 'STAGING-ENV_CHANGE-ME') && 'DEV' || 'PROD'),
});

const mapDispatchToProps = (dispatch, props) => ({
  login: (env) => dispatch(Store.user.oAuthLogin(`wfsapp${env}${window.GLOBALCERT.WFS_TEST_ENV || ''}`)),
  clearCache: () => dispatch(Store.device.wipeCache()),
  setAccess: (data) => dispatch(Store.user.setAccess(data)),
  clearUser: () => dispatch(Store.user.clear()),
  clearWFS: () => dispatch(Store.wfs.clear()),
  logoutUser: (env) => dispatch(Store.user.oAuthLogout(`wfsapp${env}${window.GLOBALCERT.WFS_TEST_ENV || ''}`)),
});

const mapResourcesToProps = (state, props) => ({});

class componentsIonicLogin extends Component {

  state = {
    showSpinner: false,
    loggingIn: false,
  };

  componentDidMount() {
    const { code, state } = this.props;
    if (code && state) {
      this.setState({ loggingIn: Date.now(), showSpinner: true });
      this.props.login(this.props.env);
    }
  }

  componentDidUpdate(nextProps) {
    if (!nextProps.access.status.updating && this.state.showSpinner) {
      this.setState({ showSpinner: false });
    }
    if (this.state.loggingIn && this.props.access.status.updating && !nextProps.access.status.updating) {
      this.setState({ loggingIn: false });
    }
  }

  login = () => {
    this.setState({ showSpinner: true, loggingIn: Date.now() });
    this.props.login(this.props.env);
  };

  logoutUser = () => {
    this.setState({ loggingIn: false });
    this.props.clearUser();
    this.props.clearWFS();
    this.props.logoutUser(this.props.env);
    this.props.setAccess({ isLoggedIn: false, isGuest: true });
  };

  render() {
    const currentTime = Date.now();
    return (
      <IonPage
        className="components_ionic_login"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CreateAnimation
          ref={this.animation}
          duration={500}
          // iterations={Infinity}
          easing="ease-out"
          fromTo={[{ property: 'opacity', fromValue: '0', toValue: '1' }]}
          play
        >

          <div style={{ textAlign: 'center' }}>
            <IonImg style={{ margin: 'auto' }} alt="myWorld logo" src={globe} />
            {
              !this.props.access.status.updating
              && !this.props.access.status.updatingError
              && (
                <>
                  <p style={{ paddingTop: '15px', paddingBottom: '15px' }}>Sign in to your account</p>
                  <IonButton
                    expand="block"
                    style={{
                      '--border-style': 'none',
                      '--border-radius': '3.62695px',
                      '--background': '#00D1FB',
                      height: '59.84px',
                    }}
                    onClick={() => { this.login(); }}
                  >
                    {this.state.showSpinner ? <IonSpinner name="crescent" /> : 'SIGN IN'}
                  </IonButton>
                </>
              )
            }
            {
              this.props.access.status.updating
              && !this.props.access.status.updatingError
              && (
                <>
                  {
                    this.state.loggingIn
                    && currentTime - this.state.loggingIn > 10000
                    && (
                      <p style={{ paddingTop: '15px' }}>
                        Login is taking longer than expected, please wait.
                      </p>
                    )
                  }
                  <IonSpinner name="crescent" />
                </>
              )
            }
            {
              !this.props.access.status.updating
              && this.props.access.status.updatingError
              && this.props.access.status.updatingError === 'Access denied'
              && (
                <>
                  <p style={{ paddingTop: '15px' }}>Access Denied</p>
                  <p style={{ paddingTop: '15px', paddingBottom: '15px' }}>
                    Your account does not have the required permission for this application.
                  </p>
                  <p style={{ paddingBottom: '15px' }}>
                    Please try again or if you need additional assistance, please call 1+888-939-4852.
                  </p>
                  <IonButton
                    expand="block"
                    style={{
                      '--border-style': 'none',
                      '--border-radius': '3.62695px',
                      '--background': '#00D1FB',
                      height: '59.84px',
                    }}
                    onClick={() => { this.logoutUser(); }}
                  >
                    Return to Sign in
                  </IonButton>
                </>
              )
            }
            {
              !this.props.access.status.updating
              && this.props.access.status.updatingError
              && this.props.access.status.updatingError !== 'Access denied'
              && (
                <>
                  <p style={{ paddingTop: '15px' }}>Something unexpected happened while signing in, please retry.</p>
                  <p style={{ paddingTop: '15px', paddingBottom: '15px' }}>Sign out of your account</p>
                  <IonButton
                    expand="block"
                    style={{
                      '--border-style': 'none',
                      '--border-radius': '3.62695px',
                      '--background': '#00D1FB',
                      height: '59.84px',
                    }}
                    onClick={() => { this.logoutUser(); }}
                  >
                    Sign out
                  </IonButton>
                  <p style={{ 'padding-top': '15px' }}>Error: &quot;{this.props.access.status.updatingError}&quot;</p>
                </>
              )
            }
          </div>
        </CreateAnimation>
      </IonPage>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(componentsIonicLogin);


