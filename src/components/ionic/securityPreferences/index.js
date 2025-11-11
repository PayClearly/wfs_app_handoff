import { connect, Component, bindActionCreators, Fragment } from 'component';
import { IonCard, IonCardHeader, IonCardContent, IonLabel, IonToggle, IonItem, IonList, CreateAnimation, IonButton, IonText, IonSpinner } from '@ionic/react';

// import Utils from 'utils';
import Store from 'store';
import Selectors from 'selectors';
// import Components from 'components';
// import Resources from 'resources';

import './index.scss';

const mapStateToProps = (state, props) => {
  return ({
    deviceSecurity: Selectors.deviceSecurity(state),
    cacheClearStatus: state.device.storage.status,
    device: state.device.data,
    featureFlags: Selectors.featureFlags(state),
  });
};

const mapDispatchToProps = (dispatch, props) => {
  return ({
    useBiometricsSet: (useBiometrics) => {
      dispatch(Store.wfs.setUseBiometrics(useBiometrics));
    },
    openModal: () => {
      dispatch(Store.router.openModal('Components.ionic.modals.bioTimeoutSelect', {}));
    },
    clearCache: () => {
      dispatch(Store.device.wipeCache());
    },
  });
};

const mapResourcesToProps = (state, props) => {
  return ({});
};

class components_ionic_securityPreferences extends Component {
  state = {
    wasToggled: false,
    toggleVal: null,
  };

  componentDidMount() {
    this.setState({ toggleVal: this.props.deviceSecurity.useBiometrics });
  }



  onToggle = (e) => {
    // we want to manage the state ourselves because the ionic event triggers twice sometimes (known bug)
    // so we just use react onClick and manage everything on our own
    const toggleVal = !this.props.deviceSecurity.useBiometrics;
    this.setState({ wasToggled: true, toggleVal });
    this.props[`${e.currentTarget.name}Set`](toggleVal);
  }

  render() {
    const selected = this.props.deviceSecurity.options.find((option => option.selected)) || {};
    const production = window.GLOBALCERT.projectId === 'payclearly-32f4e';
    return (
      <IonCard className="components_ionic_securityPreferences">
        <IonCardHeader style={{ padding: '10px 20px 5px' }}>
          {/* <IonCardTitle>Preferences</IonCardTitle> */}
          <IonItem lines="none" className="title ion-no-padding no-inner-padding">
            <IonLabel>Security Preferences</IonLabel>
          </IonItem>
        </IonCardHeader>
        <IonCardContent>
          <IonList className="margin-vertical" lines="none">
            {this.props.device.platform !== 'web' &&
              <Fragment>
                <IonItem className="ion-no-padding">
                  <IonLabel>Enable Biometrics</IonLabel>
                  <IonToggle name="useBiometrics" checked={this.props.deviceSecurity.useBiometrics} onClick={this.onToggle} disabled={!this.props.deviceSecurity.isAvailable} />
                </IonItem>
                {!this.props.deviceSecurity.isAvailable && <span>This device does not have biometrics enabled, please check your settings</span>}
                {this.props.deviceSecurity.useBiometrics ?
                  <CreateAnimation
                    duration={300}
                    easing="ease-out"
                    fromTo={[{ property: 'height', fromValue: '0%', toValue: '100%' }, { property: 'opacity', fromValue: '0', toValue: '1' }]}
                    direction={this.state.toggleVal ? 'normal' : 'reverse'}
                    play={this.state.wasToggled}
                  >
                    <IonItem button detail className="ion-no-padding" onClick={this.props.openModal}>
                      <IonLabel>Reauthenticate</IonLabel>
                      <IonLabel style={{ opacity: '.8', textAlign: 'right' }}>{selected.label}</IonLabel>
                    </IonItem>
                  </CreateAnimation>
                  : null
                }
              </Fragment>
            }
            {!production &&
              <IonItem>
                <IonLabel>Clear Cache</IonLabel>
                <IonButton
                  color="danger"
                  className="ion-text-uppercase"
                  expand="block"
                  fill="outline"
                  onClick={this.props.clearCache}
                  disabled={this.props.cacheClearStatus.deleting}
                >
                  {
                    !this.props.cacheClearStatus.deleting ?
                      <IonText color="light">Clear</IonText>
                      :
                      <IonSpinner name="crescent" />
                  }
                </IonButton>
              </IonItem>
            }
          </IonList>
        </IonCardContent>
      </IonCard>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps, mapResourcesToProps)(components_ionic_securityPreferences);


