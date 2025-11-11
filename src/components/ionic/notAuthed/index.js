import { connect, Component } from 'component';
import { IonButton, IonImg } from '@ionic/react';
import { SplashScreen } from '@capacitor/splash-screen';

import Store from 'store';
import BiometricCheck from '../../../utils/plugins/BiometricCheck';

import './index.scss';
import globe from '../login/globe.svg';

const mapStateToProps = (state, props) => ({
  access: state.user.access.data,
  biometrics: state.device.biometrics,
  device: state.device,
  logo: state.appConfig.data.logo,
  show: state.router.notAuthed,
  preferences: state.wfs.preferences.data,
  wfsStatus: state.wfs.status,
  env: _try(() => (window.GLOBALCERT.projectId === 'TEST-ENV_CHANGE-ME' || window.GLOBALCERT.projectId === 'STAGING-ENV_CHANGE-ME') && 'DEV' || 'PROD'),
});

const mapDispatchToProps = (dispatch, props) => ({
  logout: (env) => {
    dispatch(Store.user.oAuthLogout(`wfsapp${env}${window.GLOBALCERT.WFS_TEST_ENV || ''}`));
  },
  showBiometrics: () => {
    dispatch(Store.device.showBiometrics());
  },
  setBiometrics: (isAuthed) => {
    dispatch(Store.device.biometricsSetAuthed(isAuthed));
  },
  openNotAuthedPage: () => {
    dispatch(Store.router.openNotAuthed());
  },
  closeNotAuthedPage: () => {
    dispatch(Store.router.closeNotAuthed());
  },
  setUseBiometrics: (useBiometrics) => {
    dispatch(Store.wfs.setUseBiometrics(useBiometrics));
  },
});


class componentsIonicNotAuthed extends Component {

  state = {
    logUserOut: false,
  };



  componentWillReceiveProps(nextProps) {
    if (!this.props.preferences.useBiometrics) { return; }
    if (this.props.biometrics.data.isAuthed) {
      this.props.closeNotAuthedPage();
    } else {
      const notCurrentlySubmittingBiometrics = (
        !this.props.biometrics.status.submitting
        && !nextProps.biometrics.status.submitting
        && !this.props.biometrics.status.submittingError
        && !nextProps.biometrics.status.submittingError
      );
      if (this.props.device.data.isActive && notCurrentlySubmittingBiometrics) {
        if (this.props.preferences.biometricsTimeout > (Date.now() - this.props.biometrics.data.lastActive)) {
          this.closeNotAuthed();
        }
        if (!this.props.biometrics.data.lastActive) {
          this.closeNotAuthed();
        }
      }
    }
  }



  handleLogout = (biometricsChanged) => {
    if (biometricsChanged) { this.props.setUseBiometrics(false); }
    this.props.closeNotAuthedPage();
    this.props.logout(this.props.env);
  };

  closeNotAuthed = () => {
    this.props.setBiometrics(true);
    this.props.closeNotAuthedPage();
    if (this.props.device.data.platform === 'iOS' || this.props.device.data.platfrom === 'ios') {
      SplashScreen.hide();
    }
  };

  onUnlock = async () => {
    const response = await BiometricCheck.didBiometricsChange();
    if (response.value === true) {
      this.setState({ logUserOut: true });
      const logoutFunction = this.handleLogout;
      setTimeout(() => {
        logoutFunction(true);
      }, 3000, this.handleLogout);
    } else {
      this.props.showBiometrics();
    }
  };

  render() {
    const zIndex = '2147483646';
    return (
      <div className="components_ionic_notAuthed" style={{ zIndex }}>
        <div style={{
          height: '100vh',
          width: '100vw',
          zIndex,
          backgroundColor: '#0F151E',
          filter: this.props.show && this.props.biometrics.status.submitting ? 'blur(1px)' : '',
        }}
        >
          <div className="text-center">
            <IonImg style={{ margin: 'auto' }} alt="myWorld logo" src={globe} />
            {
              this.state.logUserOut
              && (
                <div style={{ textAlign: 'center', color: 'white' }}>
                  This device&apos;s security settings have changed, please sign in again to verify your identity
                </div>
              )
            }
          </div>
          {
            !this.props.biometrics.data.isAuthed
              && !this.props.biometrics.status.submitting
              && this.props.device.data.isActive
              && this.props.biometrics.data.lastActive
              && this.props.preferences.biometricsTimeout <= (Date.now() - this.props.biometrics.data.lastActive)
              ? (
                <div>
                  <IonButton className="ion-margin margin-vertical" expand="block" onClick={this.onUnlock} disabled={this.state.logUserOut}>
                    UNLOCK
                  </IonButton>
                  <IonButton className="ion-margin margin-vertical" fill="clear" expand="block" onClick={() => this.handleLogout(this.state.logUserOut || false)}>
                    SIGN OUT
                  </IonButton>
                </div>
              )
              : null
          }
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(componentsIonicNotAuthed);


